from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
from jose import jwt, JWTError
from pydantic import BaseModel
from ..config import settings


class TokenData(BaseModel):
    subject: str
    scopes: List[str] = []
    session_id: Optional[str] = None
    issuer: str
    expires_at: datetime
    role: Optional[str] = None


def create_access_token(
    subject: str,
    scopes: List[str],
    session_id: Optional[str],
    role: Optional[str] = None,
    expires_minutes: Optional[int] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    now = datetime.now(timezone.utc)
    expire_delta = timedelta(minutes=expires_minutes or settings.access_token_expire_minutes)
    expire = now + expire_delta
    to_encode = {
        "sub": subject,
        "scp": scopes,
        "sid": session_id,
        "iss": settings.token_issuer,
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "role": role,
    }
    if extra_claims:
        to_encode.update(extra_claims)
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.token_algorithm)
    return encoded_jwt


def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.token_algorithm], options={"verify_aud": False})
        subject: str = payload.get("sub")
        if subject is None:
            raise ValueError("Missing subject")
        scopes = payload.get("scp", [])
        sid = payload.get("sid")
        iss = payload.get("iss")
        exp = payload.get("exp")
        role = payload.get("role")
        if iss != settings.token_issuer:
            raise ValueError("Invalid issuer")
        if exp is None:
            raise ValueError("Missing expiration")
        return TokenData(
            subject=subject,
            scopes=scopes,
            session_id=sid,
            issuer=iss,
            expires_at=datetime.fromtimestamp(exp, tz=timezone.utc),
            role=role,
        )
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
