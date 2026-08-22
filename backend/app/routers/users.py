from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from app.core.security import hash_password
from app.db.database import DbSession
from app.dependencies.auth import AdminUser, CurrentUser
from app.models.refresh_token import RefreshToken
from app.models.user import User, UserType
from app.schemas.user import (
    AdminUserCreate,
    AdminUserUpdate,
    UserListResponse,
    UserOut,
    UserUpdate,
)
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select, update

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/me",
    response_model=UserOut,
)
def get_me(current_user: CurrentUser):
    return current_user


@router.put(
    "/me",
    response_model=UserOut,
)
def update_me(
    user_data: UserUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    if user_data.first_name is not None:
        current_user.first_name = user_data.first_name

    if user_data.last_name is not None:
        current_user.last_name = user_data.last_name

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post(
    "",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    user_data: AdminUserCreate,
    admin_user: AdminUser,
    db: DbSession,
):
    email = str(user_data.email).lower()

    existing_user = db.scalar(select(User).where(User.email == email))

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=email,
        password_hash=hash_password(user_data.password),
        type=user_data.type,
    )

    db.add(user)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(user)

    return user


@router.get(
    "",
    response_model=UserListResponse,
)
def get_users(
    admin_user: AdminUser,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
    search: Annotated[str | None, Query(max_length=100)] = None,
    user_type: UserType | None = None,
):
    query = select(User).where(User.deleted_at.is_(None))
    query = query.where(User.id != admin_user.id)

    if user_type is not None:
        query = query.where(User.type == user_type)

    if search:
        query = query.where(
            User.first_name.ilike(f"%{search}%")
            | User.last_name.ilike(f"%{search}%")
            | User.email.ilike(f"%{search}%")
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = db.scalar(count_query)

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    users = db.scalars(query).all()

    return UserListResponse(
        items=users,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.put(
    "/{user_id}",
    response_model=UserOut,
)
def update_user(
    user_id: UUID,
    user_data: AdminUserUpdate,
    admin_user: AdminUser,
    db: DbSession,
):
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use /users/me to update your own account",
        )

    user = db.scalar(
        select(User).where(
            User.id == user_id,
            User.deleted_at.is_(None),
        )
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user_data.email is not None:
        email = str(user_data.email).lower()

        existing_user = db.scalar(
            select(User).where(
                User.email == email,
                User.id != user.id,
            )
        )

        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user.email = email

    if user_data.first_name is not None:
        user.first_name = user_data.first_name

    if user_data.last_name is not None:
        user.last_name = user_data.last_name

    if user_data.type is not None:
        user.type = user_data.type

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(user)

    return user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user(
    user_id: UUID,
    admin_user: AdminUser,
    db: DbSession,
):
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account",
        )

    user = db.scalar(
        select(User).where(
            User.id == user_id,
            User.deleted_at.is_(None),
        )
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    now = datetime.now(timezone.utc)

    user.deleted_at = now

    db.execute(
        update(RefreshToken)
        .where(
            RefreshToken.user_id == user.id,
            RefreshToken.revoked_at.is_(None),
        )
        .values(revoked_at=now)
    )

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
