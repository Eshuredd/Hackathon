from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .models.entities import AuditLog


def log_event(
    db: Session,
    document_id: Optional[str],
    agent: str,
    action: str,
    result: str,
    token_subject: Optional[str] = None,
    user_session: Optional[str] = None,
) -> None:
    entry = AuditLog(
        timestamp=datetime.utcnow(),
        document_id=document_id,
        agent=agent,
        action=action,
        result=result,
        token_subject=token_subject or "system",
        user_session=user_session or "n/a",
    )
    db.add(entry)
    db.commit()
