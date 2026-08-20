from fastapi import APIRouter, status

from app.core.security import generate_share_token, hash_share_token
from app.db.database import DbSession
from app.models.drop import Drop
from app.schemas.drop import (
    DropCreateResponse,
    DropOut,
    GuestDropCreate,
)

router = APIRouter(
    prefix="/guest",
    tags=["Guest Drops"],
)


@router.post(
    "/drops",
    response_model=DropCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_guest_drop(
    data: GuestDropCreate,
    db: DbSession,
):
    share_token = generate_share_token()

    drop = Drop(
        owner_id=None,
        title=data.title,
        content=data.content,
        token_hash=hash_share_token(share_token),
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

    drop_data = DropOut.model_validate(drop)

    return DropCreateResponse(
        **drop_data.model_dump(),
        share_token=share_token,
    )
