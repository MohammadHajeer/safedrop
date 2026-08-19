from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from sqlalchemy import select

from app.core.security import decode_access_token, oauth2_scheme
from app.db.database import DbSession
from app.models.user import User


def get_current_user(
    token: Token,
    db: DbSession,
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        user_uuid = UUID(user_id)

    except (jwt.InvalidTokenError, ValueError):
        raise credentials_exception

    user = db.scalar(
        select(User).where(
            User.id == user_uuid,
            User.deleted_at.is_(None),
        )
    )

    if user is None:
        raise credentials_exception

    return user


Token = Annotated[str, Depends(oauth2_scheme)]
CurrentUser = Annotated[User, Depends(get_current_user)]
