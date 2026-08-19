from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, status
from sqlalchemy import select

from app.core.security import hash_share_token
from app.db.database import DbSession
from app.models.drop import Drop
from app.schemas.drop import DropAccessResponse

router = APIRouter(
    prefix="/d",
    tags=["Shared Drops"],
)


@router.get(
    "/{share_token}",
    response_model=DropAccessResponse,
)
def access_drop(
    share_token: Annotated[str, Path(min_length=10)],
    db: DbSession,
):
    token_hash = hash_share_token(share_token)

    drop = db.scalar(
        select(Drop).where(Drop.token_hash == token_hash).with_for_update()
    )

    now = datetime.now(timezone.utc)

    if (
        drop is None
        or drop.revoked_at is not None
        or drop.expires_at <= now
        or drop.view_count >= drop.max_views
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found or no longer available",
        )

    drop.view_count += 1
    drop.last_accessed_at = now

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return drop
