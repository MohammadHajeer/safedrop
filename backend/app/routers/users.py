from fastapi import APIRouter

from app.dependencies.auth import CurrentUser
from app.schemas.user import UserOut, UserUpdate
from app.db.database import DbSession

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
