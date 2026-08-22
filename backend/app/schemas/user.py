from datetime import datetime
from typing import Annotated
from uuid import UUID

from app.models.user import UserType
from pydantic import BaseModel, ConfigDict, EmailStr, Field

FirstName = Annotated[str, Field(min_length=2, max_length=50)]
LastName = Annotated[str, Field(min_length=2, max_length=50)]
Password = Annotated[str, Field(min_length=8, max_length=128)]


class UserCreate(BaseModel):
    first_name: FirstName
    last_name: LastName
    email: EmailStr
    password: Password


class UserUpdate(BaseModel):
    first_name: FirstName | None = None
    last_name: LastName | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    type: UserType
    deleted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class AdminUserCreate(UserCreate):
    type: UserType


class UserListResponse(BaseModel):
    items: list[UserOut]
    total: int
    page: int
    page_size: int


class AdminUserUpdate(BaseModel):
    first_name: FirstName | None = None
    last_name: LastName | None = None
    email: EmailStr | None = None
    type: UserType | None = None
