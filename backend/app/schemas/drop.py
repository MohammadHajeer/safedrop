from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

DropTitle = Annotated[str, Field(min_length=3, max_length=100)]
DropContent = Annotated[str, Field(min_length=1, max_length=10_000)]
MaxViews = Annotated[int, Field(ge=1, le=100)]


class DropStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    CONSUMED = "consumed"


class DropCreate(BaseModel):
    title: DropTitle
    content: DropContent
    expires_at: datetime
    max_views: MaxViews = 1

    @field_validator("expires_at")
    @classmethod
    def validate_expires_at(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("Expiration must include a timezone")

        now = datetime.now(timezone.utc)

        if value <= now:
            raise ValueError("Expiration must be in the future")

        if value > now + timedelta(days=30):
            raise ValueError("Expiration cannot be more than 30 days from now")

        return value


class DropOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: UUID | None
    title: str
    content: str
    expires_at: datetime
    max_views: int
    view_count: int
    revoked_at: datetime | None
    created_at: datetime
    updated_at: datetime
    last_accessed_at: datetime | None

    @computed_field
    @property
    def status(self) -> DropStatus:
        if self.revoked_at is not None:
            return DropStatus.REVOKED

        if self.expires_at <= datetime.now(timezone.utc):
            return DropStatus.EXPIRED

        if self.view_count >= self.max_views:
            return DropStatus.CONSUMED

        return DropStatus.ACTIVE


class DropCreateResponse(DropOut):
    share_token: str


class DropListResponse(BaseModel):
    items: list[DropOut]
    total: int
    page: int
    page_size: int


class ShareTokenResponse(BaseModel):
    share_token: str


class DropUpdate(BaseModel):
    title: DropTitle | None = None
    content: DropContent | None = None
    max_views: MaxViews | None = None


class DropAccessResponse(BaseModel):
    title: str
    content: str
    expires_at: datetime


GuestMaxViews = Annotated[int, Field(ge=1, le=3)]


class GuestDropCreate(BaseModel):
    title: DropTitle
    content: DropContent
    expires_at: datetime
    max_views: GuestMaxViews = 1

    @field_validator("expires_at")
    @classmethod
    def validate_expires_at(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("Expiration must include a timezone")

        now = datetime.now(timezone.utc)

        if value <= now:
            raise ValueError("Expiration must be in the future")

        if value > now + timedelta(hours=1):
            raise ValueError("Guest Drops cannot expire more than 1 hour from now")

        return value
