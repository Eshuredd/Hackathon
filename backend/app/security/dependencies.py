from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi import Request
from ..security.descope_auth import descope_auth, DescopeUser
from ..security.rbac import ROLE_SCOPES
from fastapi import HTTPException

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


def get_optional_user_id(request: Request) -> str:
    """Best-effort user id.
    - If Authorization is present, try full validation via Descope.
    - If validation fails, fall back to reading the JWT payload 'sub' claim unverified.
    - If no Authorization, return 'anonymous'.
    """
    auth = request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        return "anonymous"

    token = auth.split(" ", 1)[1].strip()
    # First, try to validate with Descope
    try:
        user = descope_auth.validate_session(token)
        return user.user_id
    except Exception:
        # Fallback: parse JWT payload unverified to separate carts per user
        try:
            payload_b64 = token.split(".")[1]
            # Pad base64
            padding = '=' * (-len(payload_b64) % 4)
            import base64, json
            data = json.loads(base64.urlsafe_b64decode(payload_b64 + padding).decode("utf-8"))
            uid = data.get("sub") or data.get("userId") or data.get("uid") or data.get("loginId")
            if isinstance(uid, str) and uid:
                return uid
        except Exception:
            pass
        return "anonymous"
