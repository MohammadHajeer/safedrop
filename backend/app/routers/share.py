from datetime import datetime, timezone
from typing import Annotated

from app.core.security import hash_share_token
from app.db.database import DbSession
from app.models.drop import Drop
from app.models.drop_file import DropFile
from app.schemas.drop import DropAccessResponse
from app.schemas.drop_file import DropAccessFile
from app.services.storage import create_presigned_download_url
from fastapi import APIRouter, HTTPException, Path, status
from sqlalchemy import select

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

    drop_files = db.scalars(
        select(DropFile)
        .where(
            DropFile.drop_id == drop.id,
            DropFile.uploaded_at.is_not(None),
            DropFile.storage_deleted_at.is_(None),
        )
        .order_by(DropFile.created_at.asc())
    ).all()

    files = [
        DropAccessFile(
            id=drop_file.id,
            original_name=drop_file.original_name,
            content_type=drop_file.content_type,
            size_bytes=drop_file.size_bytes,
            download_url=create_presigned_download_url(
                drop_file.storage_key,
            ),
        )
        for drop_file in drop_files
    ]

    drop.view_count += 1
    drop.last_accessed_at = now

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return DropAccessResponse(
        title=drop.title,
        content=drop.content,
        expires_at=drop.expires_at,
        files=files,
    )
