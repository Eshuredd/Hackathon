from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from descope import DescopeClient, AuthException
from descope.auth import Auth
# Management is accessed via client.mgmt, not directly imported
from pydantic import BaseModel
from ..config import settings


class DescopeUser(BaseModel):
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    roles: list = []
    custom_attributes: Dict[str, Any] = {}


class DescopeAuth:
    def __init__(self):
        self.client = DescopeClient(project_id=settings.descope_project_id)
        self.auth = Auth(project_id=settings.descope_project_id)
        # Management is accessed via client.mgmt
        self.management = self.client.mgmt

    def validate_session(self, session_token: str) -> DescopeUser:
        """Validate a session token and return user information"""
        try:
            # Use the simpler session validation approach
            jwt_response = self.client.validate_session(session_token=session_token)
            user_id = jwt_response.get("sub")
            
            # Get user details from Descope
            try:
                user_response = self.management.user.load(user_id)
                user_data = user_response.get("user", {})
                
                return DescopeUser(
                    user_id=user_id,
                    email=user_data.get("email"),
                    name=user_data.get("name"),
                    phone=user_data.get("phone"),
                    roles=user_data.get("roleNames", []),
                    custom_attributes=user_data.get("customAttributes", {})
                )
            except AuthException:
                # If we can't get user details, return basic info from JWT
                return DescopeUser(
                    user_id=user_id,
                    email=jwt_response.get("email"),
                    name=jwt_response.get("name"),
                    roles=jwt_response.get("roleNames", []),
                    custom_attributes=jwt_response.get("customAttributes", {})
                )
        except AuthException as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid session token: {str(e)}"
            )

    def create_user(self, email: str, password: str, name: Optional[str] = None, roles: Optional[list] = None) -> str:
        """Create a new user in Descope"""
        try:
            user_response = self.management.user.create(
                email=email,
                password=password,
                name=name or "",
                role_names=roles or []
            )
            return user_response.get("user", {}).get("id")
        except AuthException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create user: {str(e)}"
            )

    def sign_in(self, email: str, password: str) -> Dict[str, Any]:
        """Sign in a user and return session information"""
        try:
            auth_response = self.auth.password.sign_in(email, password)
            return {
                "session_token": auth_response.get("sessionToken"),
                "refresh_token": auth_response.get("refreshToken"),
                "user_id": auth_response.get("user", {}).get("id")
            }
        except AuthException as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid credentials: {str(e)}"
            )

    def sign_up(self, email: str, password: str, name: Optional[str] = None) -> Dict[str, Any]:
        """Sign up a new user"""
        try:
            auth_response = self.auth.password.sign_up(email, password, name or "")
            return {
                "session_token": auth_response.get("sessionToken"),
                "refresh_token": auth_response.get("refreshToken"),
                "user_id": auth_response.get("user", {}).get("id")
            }
        except AuthException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to sign up: {str(e)}"
            )

    def refresh_session(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh a session using refresh token"""
        try:
            auth_response = self.auth.refresh(refresh_token)
            return {
                "session_token": auth_response.get("sessionToken"),
                "refresh_token": auth_response.get("refreshToken")
            }
        except AuthException as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid refresh token: {str(e)}"
            )

    def sign_out(self, session_token: str) -> bool:
        """Sign out a user"""
        try:
            self.auth.logout(session_token)
            return True
        except AuthException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to sign out: {str(e)}"
            )

    def assign_role(self, user_id: str, role_name: str) -> bool:
        """Assign a role to a user"""
        try:
            self.management.user.add_role(user_id, role_name)
            return True
        except AuthException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to assign role: {str(e)}"
            )

    def remove_role(self, user_id: str, role_name: str) -> bool:
        """Remove a role from a user"""
        try:
            self.management.user.remove_role(user_id, role_name)
            return True
        except AuthException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to remove role: {str(e)}"
            )


# Global instance
descope_auth = DescopeAuth()
