from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from app.core.security import hash_password, verify_password, create_access_token
from app.db.database import DbSession
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest, AuthResponse

from typing import Annotated

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(user_data: UserCreate, db: DbSession):
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
    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        user_id=user.id,
        user_type=user.type,
    )

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

    return AuthResponse(
        access_token=access_token,
        user=user,
    )