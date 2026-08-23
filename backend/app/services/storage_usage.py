from datetime import datetime
from uuid import UUID

from app.models.drop import Drop
from app.models.drop_file import DropFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session


def get_active_user_storage(
    db: Session,
    user_id: UUID,
    now: datetime,
) -> int:
    """Return finalized and pending file bytes reserved by a user's active Drops."""
    return (
        db.scalar(
            select(func.coalesce(func.sum(DropFile.size_bytes), 0))
            .join(Drop, DropFile.drop_id == Drop.id)
            .where(
                Drop.owner_id == user_id,
                Drop.revoked_at.is_(None),
                Drop.expires_at > now,
                Drop.view_count < Drop.max_views,
                DropFile.storage_deleted_at.is_(None),
            )
        )
        or 0
    )


def get_platform_storage(db: Session) -> int:
    """Return bytes reserved by physical objects that have not been cleaned up."""
    return (
        db.scalar(
            select(func.coalesce(func.sum(DropFile.size_bytes), 0)).where(
                DropFile.storage_deleted_at.is_(None),
            )
        )
        or 0
    )
