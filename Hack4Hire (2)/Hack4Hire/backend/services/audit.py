from datetime import datetime, timezone

from ..db.models import AuditLog
from ..db.session import SessionLocal


def log_activity(employee_id: str, action: str) -> AuditLog:
    """Save one onboarding activity to PostgreSQL.

    Reusable by every agent. Examples:
        log_activity("E001", "Onboarding started")
        log_activity("E001", "Task update: document_verification -> completed")
        log_activity("E001", "Completed=['training'] Pending=['team_allocation']")
    """
    session = SessionLocal()
    try:
        entry = AuditLog(
            employee_id=employee_id,
            action=action,
            timestamp=datetime.now(timezone.utc),
        )
        session.add(entry)
        session.commit()
        session.refresh(entry)
        return entry
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
