from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.core.security import generate_share_token, hash_share_token
from app.core.storage_limits import (
    GUEST_MAX_FILE_SIZE,
    GUEST_MAX_FILES_PER_DROP,
    PLATFORM_MAX_STORAGE,
)
from app.db.database import DbSession
from app.dependencies.guest import GuestManagedDrop
from app.models.drop import Drop
from app.models.drop_file import DropFile
from app.schemas.drop import (
    DropOut,
    GuestDropCreate,
    GuestDropCreateResponse,
)
from app.schemas.drop_file import DropFileOut, FileUploadRequest, FileUploadResponse
from app.services.storage import (
    create_presigned_upload,
    delete_file,
    get_file_metadata,
    promote_file,
)
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

router = APIRouter(
    prefix="/guest",
    tags=["Guest Drops"],
)


@router.post(
    "/drops",
    response_model=GuestDropCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_guest_drop(
    data: GuestDropCreate,
    db: DbSession,
):
    share_token = generate_share_token()
    management_token = generate_share_token()

    drop = Drop(
        owner_id=None,
        title=data.title,
        content=data.content,
        expires_at=data.expires_at,
        max_views=data.max_views,
        token_hash=hash_share_token(share_token),
        guest_management_token_hash=hash_share_token(management_token),
    )

    db.add(drop)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(drop)

    drop_data = DropOut.model_validate(drop)

    return GuestDropCreateResponse(
        **drop_data.model_dump(),
        share_token=share_token,
        management_token=management_token,
    )


@router.post(
    "/drops/{drop_id}/files/presign",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_guest_file_upload(
    data: FileUploadRequest,
    db: DbSession,
    drop: GuestManagedDrop,
):
    now = datetime.now(timezone.utc)

    # Lock the Drop so two simultaneous requests cannot both
    # reserve the guest's single allowed file.
    drop = db.scalar(select(Drop).where(Drop.id == drop.id).with_for_update())

    if (
        drop.revoked_at is not None
        or drop.expires_at <= now
        or drop.view_count >= drop.max_views
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Files cannot be added to an inactive Drop",
        )

    if data.size_bytes > GUEST_MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Guest files cannot exceed 5 MB",
        )

    file_count = (
        db.scalar(
            select(func.count(DropFile.id)).where(
                DropFile.drop_id == drop.id,
                DropFile.storage_deleted_at.is_(None),
            )
        )
        or 0
    )

    if file_count >= GUEST_MAX_FILES_PER_DROP:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Guest Drops support only one file",
        )

    platform_storage = (
        db.scalar(
            select(func.coalesce(func.sum(DropFile.size_bytes), 0)).where(
                DropFile.storage_deleted_at.is_(None),
            )
        )
        or 0
    )

    if platform_storage + data.size_bytes > PLATFORM_MAX_STORAGE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SafeDrop storage capacity has been reached",
        )

    file_id = uuid4()

    storage_key = f"pending/{drop.id}/{file_id}"

    drop_file = DropFile(
        id=file_id,
        drop_id=drop.id,
        original_name=data.original_name,
        content_type=data.content_type,
        size_bytes=data.size_bytes,
        storage_key=storage_key,
    )

    db.add(drop_file)
    db.commit()

    presigned = create_presigned_upload(
        storage_key=storage_key,
        content_type=data.content_type,
        max_size=data.size_bytes,
        expires_in=300,
    )

    return FileUploadResponse(
        file_id=file_id,
        upload_url=presigned["url"],
        fields=presigned["fields"],
        expires_in=300,
    )


@router.post(
    "/drops/{drop_id}/files/{file_id}/complete",
    response_model=DropFileOut,
)
def complete_guest_file_upload(
    file_id: UUID,
    db: DbSession,
    drop: GuestManagedDrop,
):
    now = datetime.now(timezone.utc)

    drop_file = db.scalar(
        select(DropFile)
        .where(
            DropFile.id == file_id,
            DropFile.drop_id == drop.id,
        )
        .with_for_update()
    )

    if drop_file is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    if drop_file.uploaded_at is not None:
        return drop_file

    if (
        drop.revoked_at is not None
        or drop.expires_at <= now
        or drop.view_count >= drop.max_views
    ):
        metadata = get_file_metadata(drop_file.storage_key)

        if metadata is not None:
            delete_file(drop_file.storage_key)

        db.delete(drop_file)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Drop is no longer active",
        )

    metadata = get_file_metadata(drop_file.storage_key)

    if metadata is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="File upload has not completed",
        )

    if metadata["ContentLength"] != drop_file.size_bytes:
        delete_file(drop_file.storage_key)

        db.delete(drop_file)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file size does not match the reserved size",
        )

    if metadata.get("ContentType") != drop_file.content_type:
        delete_file(drop_file.storage_key)

        db.delete(drop_file)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file type does not match the reserved type",
        )

    temporary_key = drop_file.storage_key
    final_key = f"drops/{drop.id}/{drop_file.id}"

    promote_file(
        temporary_key=temporary_key,
        final_key=final_key,
    )

    drop_file.storage_key = final_key
    drop_file.uploaded_at = now

    db.commit()
    db.refresh(drop_file)

    return drop_file
