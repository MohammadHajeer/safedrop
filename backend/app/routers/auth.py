from fastapi import APIRouter, HTTPException, status, Depends, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
    set_refresh_token_cookie,
)
from app.db.database import DbSession
from app.models import User, RefreshToken
from app.schemas.user import UserCreate
from app.schemas.auth import AuthResponse

from typing import Annotated

from datetime import datetime, timedelta, timezone
from uuid import UUID


from app.core.config import settings

router = APIRouter(tags=["Authentication"])

RefreshTokenCookie = Annotated[
    str | None,
    Cookie(alias="refresh_token"),
]


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    response: Response,
    user_data: UserCreate,
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
    )

    db.add(user)
    db.flush()

    access_token = create_access_token(
        user_id=user.id,
        user_type=user.type,
    )

    refresh_token, refresh_expires_at = create_refresh_token_session(
        user_id=user.id,
        db=db,
    )

    set_refresh_token_cookie(
        response=response,
        refresh_token=refresh_token,
        expires_at=refresh_expires_at,
    )

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(user)

    return AuthResponse(
        access_token=access_token,
        user=user,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbSession,
):
    email = str(form_data.username).lower()

    user = db.scalar(select(User).where(User.email == email))

    if (
        user is None
        or user.deleted_at is not None
        or not verify_password(form_data.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        user_id=user.id,
        user_type=user.type,
    )

    refresh_token, refresh_expires_at = create_refresh_token_session(
        user_id=user.id,
        db=db,
    )

    set_refresh_token_cookie(
        response=response,
        refresh_token=refresh_token,
        expires_at=refresh_expires_at,
    )

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return AuthResponse(
        access_token=access_token,
        user=user,
    )


@router.post("/logout")
def logout(
    response: Response,
    db: DbSession,
    refresh_token: RefreshTokenCookie = None,
):
    if refresh_token is not None:
        token_hash = hash_refresh_token(refresh_token)

        stored_token = db.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )

        if stored_token is not None and stored_token.revoked_at is None:
            stored_token.revoked_at = datetime.now(timezone.utc)

            try:
                db.commit()
            except Exception:
                db.rollback()
                raise

    response.delete_cookie(
        key="refresh_token",
        path="/",
    )

    return {"message": "Logged out successfully"}


def create_refresh_token_session(
    user_id: UUID,
    db: Session,
    expires_at: datetime | None = None,
) -> tuple[str, datetime]:
    if expires_at is None:
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.refresh_token_expire_days
        )

    raw_token = generate_refresh_token()

    refresh_token = RefreshToken(
        user_id=user_id,
        token_hash=hash_refresh_token(raw_token),
        expires_at=expires_at,
    )

    db.add(refresh_token)

    return raw_token, expires_at


@router.post(
    "/refresh",
    response_model=AuthResponse,
)
def refresh(
    response: Response,
    db: DbSession,
    refresh_token: RefreshTokenCookie = None,
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
    )

    if refresh_token is None:
        raise credentials_exception

    token_hash = hash_refresh_token(refresh_token)

    stored_token = db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )

    if (
        stored_token is None
        or stored_token.revoked_at is not None
        or stored_token.expires_at <= datetime.now(timezone.utc)
    ):
        raise credentials_exception

    user = db.get(User, stored_token.user_id)

    if user is None or user.deleted_at is not None:
        raise credentials_exception

    # Consume the old refresh token
    stored_token.revoked_at = datetime.now(timezone.utc)

    # Rotate it, but preserve the ORIGINAL session expiration
    new_refresh_token, refresh_expires_at = create_refresh_token_session(
        user_id=user.id,
        db=db,
        expires_at=stored_token.expires_at,
    )

    new_access_token = create_access_token(
        user_id=user.id,
        user_type=user.type,
    )

    set_refresh_token_cookie(
        response=response,
        refresh_token=new_refresh_token,
        expires_at=refresh_expires_at,
    )

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return AuthResponse(
        access_token=new_access_token,
        user=user,
    )
