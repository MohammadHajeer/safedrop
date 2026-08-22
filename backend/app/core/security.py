import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

import jwt
from app.core.config import settings
from app.models.user import UserType
from cryptography.fernet import Fernet
from fastapi import Response
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash

fernet = Fernet(settings.drop_encryption_key)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(
    user_id: UUID,
    user_type: UserType,
) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    payload = {
        "sub": str(user_id),
        "type": user_type.value,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def set_refresh_token_cookie(
    response: Response,
    refresh_token: str,
    expires_at: datetime,
) -> None:
    expires_at = expires_at.astimezone(timezone.utc)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        expires=expires_at,
        path="/",
    )


def generate_share_token() -> str:
    return secrets.token_urlsafe(32)


def hash_share_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def encrypt_share_token(token: str) -> str:
    return fernet.encrypt(token.encode()).decode()


def decrypt_share_token(encrypted_token: str) -> str:
    return fernet.decrypt(encrypted_token.encode()).decode()
