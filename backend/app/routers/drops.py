from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, or_
from typing import Annotated
from datetime import datetime, timezone
from uuid import UUID

from app.core.security import (
    generate_share_token,
    hash_share_token,
    encrypt_share_token,
    decrypt_share_token,
)
from app.db.database import DbSession
from app.dependencies.auth import CurrentUser
from app.models.drop import Drop
from app.schemas.drop import (
    DropCreate,
    DropCreateResponse,
    DropOut,
    DropListResponse,
    ShareTokenResponse,
    DropUpdate,
)

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
):
    now = datetime.now(timezone.utc)

    query = select(Drop).where(
        Drop.owner_id == current_user.id,
        Drop.revoked_at.is_(None),
        Drop.expires_at > now,
        Drop.view_count < Drop.max_views,
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

    if "max_views" in update_data:
        if update_data["max_views"] < drop.view_count:
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

    return None
