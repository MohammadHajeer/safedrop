from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.security import hash_password
from app.db.database import DbSession
from app.models.user import User
from app.schemas.user import UserCreate, UserOut

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserOut,
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

    return user
