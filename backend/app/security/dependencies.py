from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from ..security.descope_auth import descope_auth, DescopeUser
from ..security.rbac import ROLE_SCOPES

security = HTTPBearer()


def get_current_user(token: str = Depends(security)) -> DescopeUser:
    """Get current user from Descope session token"""
    try:
        user = descope_auth.validate_session(token.credentials)
        return user
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


def require_roles(required_roles: List[str]):
    """Require specific roles for access"""
    def dep(user: DescopeUser = Depends(get_current_user)) -> DescopeUser:
        user_roles = set(user.roles)
        required = set(required_roles)
        if not required.intersection(user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Required roles: {required_roles}, User roles: {list(user_roles)}"
            )
        return user
    return dep


def require_scopes(required_scopes: List[str]):
    """Require specific scopes for access (maps roles to scopes)"""
    def dep(user: DescopeUser = Depends(get_current_user)) -> DescopeUser:
        user_scopes = []
        for role in user.roles:
            user_scopes.extend(ROLE_SCOPES.get(role, []))
        
        missing = [s for s in required_scopes if s not in user_scopes]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Missing scopes: {missing}"
            )
        return user
    return dep


def scopes_for_role(role: str) -> List[str]:
    """Get scopes for a given role"""
    return ROLE_SCOPES.get(role, [])


def get_user_id(user: DescopeUser = Depends(get_current_user)) -> str:
    """Get user ID from current user"""
    return user.user_id
