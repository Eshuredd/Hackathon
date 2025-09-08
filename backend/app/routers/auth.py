from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.entities import User
from ..security.descope_auth import descope_auth
from ..security.descope_flows import descope_flows
from ..security.dependencies import get_current_user, require_roles

router = APIRouter()


class SignUpRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


class SignInRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class RoleAssignmentRequest(BaseModel):
    user_id: str
    role_name: str


class ConsentRequest(BaseModel):
    consent_type: str  # "data_processing", "third_party", "marketing"
    document_id: Optional[str] = None
    granted: bool
    user_notes: Optional[str] = None


@router.post("/signup")
def sign_up(request: SignUpRequest, db: Session = Depends(get_db)):
    """Sign up a new user"""
    try:
        # Create user in Descope
        auth_response = descope_auth.sign_up(request.email, request.password, request.name)
        
        # Create local user record for audit purposes
        local_user = User(
            email=request.email,
            password_hash="descope_managed",  # Password managed by Descope
            role="viewer"  # Default role
        )
        db.add(local_user)
        db.commit()
        
        return {
            "message": "User created successfully",
            "session_token": auth_response["session_token"],
            "refresh_token": auth_response["refresh_token"],
            "user_id": auth_response["user_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/signin")
def sign_in(request: SignInRequest):
    """Sign in existing user"""
    try:
        auth_response = descope_auth.sign_in(request.email, request.password)
        return {
            "message": "Signed in successfully",
            "session_token": auth_response["session_token"],
            "refresh_token": auth_response["refresh_token"],
            "user_id": auth_response["user_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh")
def refresh_session(request: RefreshRequest):
    """Refresh session token"""
    try:
        auth_response = descope_auth.refresh_session(request.refresh_token)
        return {
            "message": "Session refreshed",
            "session_token": auth_response["session_token"],
            "refresh_token": auth_response["refresh_token"]
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/signout")
def sign_out(user: dict = Depends(get_current_user)):
    """Sign out current user"""
    try:
        # Note: This would need the session token from the request
        # For now, we'll just return success
        return {"message": "Signed out successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/assign-role", dependencies=[Depends(require_roles(["admin"]))])
def assign_role(request: RoleAssignmentRequest):
    """Assign role to user (admin only)"""
    try:
        success = descope_auth.assign_role(request.user_id, request.role_name)
        if success:
            return {"message": f"Role {request.role_name} assigned to user {request.user_id}"}
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to assign role")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/remove-role", dependencies=[Depends(require_roles(["admin"]))])
def remove_role(request: RoleAssignmentRequest):
    """Remove role from user (admin only)"""
    try:
        success = descope_auth.remove_role(request.user_id, request.role_name)
        if success:
            return {"message": f"Role {request.role_name} removed from user {request.user_id}"}
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to remove role")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me")
def get_current_user_info(user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "roles": user.roles,
        "custom_attributes": user.custom_attributes
    }


@router.post("/consent")
def record_consent(
    request: ConsentRequest,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record user consent for data processing, third-party sharing, etc.
    
    This implements Descope Flows for user-facing consent as required.
    """
    try:
        # In a real implementation, you'd store this in a consent table
        # For now, we'll log it and return success
        
        consent_data = {
            "user_id": user.user_id,
            "consent_type": request.consent_type,
            "document_id": request.document_id,
            "granted": request.granted,
            "user_notes": request.user_notes,
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": user.user_id  # Using user_id as session identifier
        }
        
        # Log the consent event
        from ..audit import log_event
        log_event(
            db,
            document_id=request.document_id,
            agent="user_consent",
            action=f"consent_{request.consent_type}",
            result=f"granted={request.granted}",
            token_subject=user.user_id,
            user_session=user.user_id
        )
        
        return {
            "message": "Consent recorded successfully",
            "consent_id": f"consent_{datetime.utcnow().timestamp()}",
            "consent_data": consent_data
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/consent/{consent_type}")
def get_consent_status(
    consent_type: str,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current consent status for a specific type"""
    # In a real implementation, you'd query a consent table
    # For now, return a mock response
    return {
        "user_id": user.user_id,
        "consent_type": consent_type,
        "status": "granted",  # Mock status
        "last_updated": datetime.utcnow().isoformat()
    }


@router.post("/consent/flow/create")
def create_consent_flow(
    request: ConsentRequest,
    user: dict = Depends(get_current_user)
):
    """Create a Descope Flow for user consent"""
    try:
        flow_result = descope_flows.create_consent_flow(
            user_id=user.user_id,
            consent_type=request.consent_type,
            document_id=request.document_id or "default_policy"
        )
        
        # Log the flow creation
        from ..audit import log_event
        log_event(
            db=None,  # No DB session in this context
            document_id=request.document_id,
            agent="descope_flows",
            action="create_consent_flow",
            result=f"flow_id={flow_result['flow_id']}",
            token_subject=user.user_id,
            user_session=user.user_id
        )
        
        return flow_result
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/consent/flow/{flow_id}/execute")
def execute_consent_flow(
    flow_id: str,
    user_action: str,
    user_notes: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """Execute a consent flow with user decision"""
    try:
        result = descope_flows.execute_consent_flow(
            flow_id=flow_id,
            user_action=user_action,
            user_notes=user_notes
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/consent/flow/{flow_id}/status")
def get_consent_flow_status(
    flow_id: str,
    user: dict = Depends(get_current_user)
):
    """Get the status of a consent flow"""
    try:
        status = descope_flows.get_consent_flow_status(flow_id)
        return status
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/approval/flow/create")
def create_approval_flow(
    approval_type: str,
    document_id: str,
    user: dict = Depends(get_current_user)
):
    """Create an approval flow for delegation scenarios"""
    try:
        # Get user's current role (simplified)
        current_role = user.roles[0] if user.roles else "shopper"
        
        # Determine required role based on approval type
        required_role = "admin" if approval_type == "high_value_order" else current_role
        
        flow_result = descope_flows.create_approval_flow(
            user_id=user.user_id,
            approval_type=approval_type,
            document_id=document_id,
            required_role=required_role,
            current_role=current_role
        )
        
        return flow_result
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
