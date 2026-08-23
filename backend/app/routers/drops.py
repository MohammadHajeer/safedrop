from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID, uuid4

from app.core.security import (
    decrypt_share_token,
    encrypt_share_token,
    generate_share_token,
    hash_share_token,
)
from app.core.storage_limits import (
    PLATFORM_MAX_STORAGE,
    USER_MAX_ACTIVE_STORAGE,
    USER_MAX_DROP_STORAGE,
    USER_MAX_FILE_SIZE,
    USER_MAX_FILES_PER_DROP,
)
from app.db.database import DbSession
from app.dependencies.auth import CurrentUser
from app.models.drop import Drop
from app.models.drop_file import DropFile
from app.models.user import User
from app.schemas.drop import (
    DropCreate,
    DropCreateResponse,
    DropListResponse,
    DropOut,
    DropStatus,
    DropUpdate,
    ShareTokenResponse,
)
from app.schemas.drop_file import DropFileOut, FileUploadRequest, FileUploadResponse
from app.services.storage import (
    create_presigned_upload,
    delete_file,
    get_file_metadata,
    promote_file,
)
from app.services.storage_usage import get_active_user_storage
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, or_, select

router = APIRouter(
    prefix="/drops",
    tags=["Drops"],
)


@router.get(
    "",
    response_model=DropListResponse,
)
def get_my_drops(
    current_user: CurrentUser,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
    search: Annotated[str | None, Query(max_length=100)] = None,
    drop_status: Annotated[
        DropStatus,
        Query(alias="status"),
    ] = DropStatus.ACTIVE,
):
    now = datetime.now(timezone.utc)

    query = select(Drop).where(
        Drop.owner_id == current_user.id,
    )

    if drop_status == DropStatus.REVOKED:
        query = query.where(
            Drop.revoked_at.is_not(None),
        )
    elif drop_status == DropStatus.EXPIRED:
        query = query.where(
            Drop.revoked_at.is_(None),
            Drop.expires_at <= now,
        )
    elif drop_status == DropStatus.CONSUMED:
        query = query.where(
            Drop.revoked_at.is_(None),
            Drop.expires_at > now,
            Drop.max_views <= Drop.view_count,
        )
    else:  # Active
        query = query.where(
            Drop.revoked_at.is_(None),
            Drop.expires_at > now,
            Drop.max_views > Drop.view_count,
        )

    if search:
        query = query.where(
            or_(
                Drop.title.ilike(f"%{search}%"),
                Drop.content.ilike(f"%{search}%"),
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = db.scalar(count_query) or 0

    offset = (page - 1) * page_size

    query = query.order_by(Drop.created_at.desc()).offset(offset).limit(page_size)

    drops = db.scalars(query).all()

    return DropListResponse(
        items=drops,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=DropCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_drop(
    data: DropCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    share_token = generate_share_token()

    drop = Drop(
        owner_id=current_user.id,
        title=data.title,
        content=data.content,
        token_hash=hash_share_token(share_token),
        encrypted_token=encrypt_share_token(share_token),
        expires_at=data.expires_at,
        max_views=data.max_views,
    )

    db.add(drop)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(drop)

    return DropCreateResponse(
        **DropOut.model_validate(drop).model_dump(),
        share_token=share_token,
    )


@router.get(
    "/{drop_id}/share-token",
    response_model=ShareTokenResponse,
)
def get_share_token(
    drop_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
):
    drop = db.scalar(
        select(Drop).where(
            Drop.id == drop_id,
            Drop.owner_id == current_user.id,
        )
    )

    if drop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )

    if drop.encrypted_token is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Share token is not available for this Drop",
        )

    share_token = decrypt_share_token(drop.encrypted_token)

    return ShareTokenResponse(
        share_token=share_token,
    )


@router.get(
    "/{drop_id}",
    response_model=DropOut,
)
def get_my_drop(
    drop_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
):
    drop = db.scalar(
        select(Drop).where(
            Drop.id == drop_id,
            Drop.owner_id == current_user.id,
        )
    )

    if drop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )

    return drop


@router.get(
    "/{drop_id}/files",
    response_model=list[DropFileOut],
)
def get_my_drop_files(
    drop_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
):
    drop = db.scalar(
        select(Drop).where(
            Drop.id == drop_id,
            Drop.owner_id == current_user.id,
        )
    )

    if drop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )

    return db.scalars(
        select(DropFile)
        .where(
            DropFile.drop_id == drop.id,
            DropFile.uploaded_at.is_not(None),
            DropFile.storage_deleted_at.is_(None),
        )
        .order_by(DropFile.created_at.asc(), DropFile.id.asc())
    ).all()


@router.patch(
    "/{drop_id}",
    response_model=DropOut,
)
def update_my_drop(
    drop_id: UUID,
    data: DropUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    drop = db.scalar(
        select(Drop).where(
            Drop.id == drop_id,
            Drop.owner_id == current_user.id,
        )
    )

    if drop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )

    if drop.revoked_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A revoked Drop cannot be updated",
        )

    now = datetime.now(timezone.utc)

    if drop.expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An expired Drop cannot be updated",
        )

    update_data = data.model_dump(exclude_unset=True)

    if "max_views" in update_data and update_data["max_views"] < drop.view_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Max views cannot be lower than the current view count",
        )

    for field, value in update_data.items():
        setattr(drop, field, value)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(drop)

    return drop


@router.delete(
    "/{drop_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def revoke_drop(
    drop_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
):
    drop = db.scalar(
        select(Drop).where(
            Drop.id == drop_id,
            Drop.owner_id == current_user.id,
        )
    )

    if drop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )

    if drop.revoked_at is None:
        drop.revoked_at = datetime.now(timezone.utc)

        try:
            db.commit()
        except Exception:
            db.rollback()
            raise


@router.post(
    "/{drop_id}/files/presign",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_file_upload(
    drop_id: UUID,
    payload: FileUploadRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    now = datetime.now(timezone.utc)

    # Serialize upload reservations for this user.
    db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    ).scalar_one()

    drop = db.scalar(
        select(Drop).where(
            Drop.id == drop_id,
            Drop.owner_id == current_user.id,
        )
    )

    if drop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )

    # File uploads only belong to active Drops.
    if (
        drop.revoked_at is not None
        or drop.expires_at <= now
        or drop.view_count >= drop.max_views
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Files cannot be added to an inactive Drop",
        )

    # Individual file limit: 10 MiB.
    if payload.size_bytes > USER_MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="File exceeds the 10 MB limit",
        )

    # Pending uploads count too.
    existing_files = (
        db.scalar(
            select(func.count(DropFile.id)).where(
                DropFile.drop_id == drop.id,
                DropFile.storage_deleted_at.is_(None),
            )
        )
        or 0
    )

    if existing_files >= USER_MAX_FILES_PER_DROP:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Drop already has the maximum number of files",
        )

    drop_storage = (
        db.scalar(
            select(func.coalesce(func.sum(DropFile.size_bytes), 0)).where(
                DropFile.drop_id == drop.id,
                DropFile.storage_deleted_at.is_(None),
            )
        )
        or 0
    )

    if drop_storage + payload.size_bytes > USER_MAX_DROP_STORAGE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Drop would exceed its storage limit",
        )

    active_user_storage = get_active_user_storage(db, current_user.id, now)

    if active_user_storage + payload.size_bytes > USER_MAX_ACTIVE_STORAGE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Your active storage quota would be exceeded",
        )

    platform_storage = (
        db.scalar(
            select(func.coalesce(func.sum(DropFile.size_bytes), 0)).where(
                DropFile.storage_deleted_at.is_(None),
            )
        )
        or 0
    )

    if platform_storage + payload.size_bytes > PLATFORM_MAX_STORAGE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SafeDrop storage capacity has been reached",
        )

    file_id = uuid4()

    temporary_key = f"pending/{drop.id}/{file_id}"

    drop_file = DropFile(
        id=file_id,
        drop_id=drop.id,
        original_name=payload.original_name,
        storage_key=temporary_key,
        content_type=payload.content_type,
        size_bytes=payload.size_bytes,
    )

    db.add(drop_file)
    db.commit()

    presigned = create_presigned_upload(
        storage_key=temporary_key,
        content_type=payload.content_type,
        max_size=payload.size_bytes,
        expires_in=300,
    )

    return FileUploadResponse(
        file_id=file_id,
        upload_url=presigned["url"],
        fields=presigned["fields"],
        expires_in=300,
    )


@router.post(
    "/{drop_id}/files/{file_id}/complete",
    response_model=DropFileOut,
)
def complete_file_upload(
    drop_id: UUID,
    file_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    now = datetime.now(timezone.utc)

    # Make sure this is the user's Drop.
    drop = db.scalar(
        select(Drop).where(
            Drop.id == drop_id,
            Drop.owner_id == current_user.id,
        )
    )

    if drop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )

    # Lock this file reservation so two completion requests
    # cannot finalize it simultaneously.
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

    # Makes the endpoint safe to retry.
    if drop_file.uploaded_at is not None:
        return drop_file

    # The Drop may have become inactive while the file was uploading.
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

    # At this point storage_key is still:
    # pending/<drop_id>/<file_id>
    metadata = get_file_metadata(drop_file.storage_key)

    if metadata is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="File upload has not completed",
        )

    actual_size = metadata["ContentLength"]
    actual_content_type = metadata.get("ContentType")

    # The browser's claimed size was what we reserved against quota.
    # Therefore the stored object must match it exactly.
    if actual_size != drop_file.size_bytes:
        delete_file(drop_file.storage_key)

        db.delete(drop_file)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file size does not match the reserved size",
        )

    if actual_content_type != drop_file.content_type:
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
