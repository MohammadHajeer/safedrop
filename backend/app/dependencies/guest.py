from hmac import compare_digest
from typing import Annotated
from uuid import UUID

from app.core.security import hash_share_token
from app.db.database import DbSession
from app.models.drop import Drop
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select


def get_guest_managed_drop(
    drop_id: UUID,
    db: DbSession,
    management_token: Annotated[
        str | None,
        Header(alias="X-Guest-Management-Token"),
    ] = None,
) -> Drop:
    if management_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Guest management token required",
        )

    drop = db.scalar(
        select(Drop).where(
            Drop.id == drop_id,
            Drop.owner_id.is_(None),
        )
    )

    if (
        drop is None
        or drop.guest_management_token_hash is None
        or not compare_digest(
            drop.guest_management_token_hash,
            hash_share_token(management_token),
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )

    return drop


GuestManagedDrop = Annotated[
    Drop,
    Depends(get_guest_managed_drop),
]
