from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    Integer,
    String,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserType(str, Enum):
    ADMIN = "admin"
    CLIENT = "client"


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    first_name: Mapped[str] = mapped_column(String(50))
    last_name: Mapped[str] = mapped_column(String(50))

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
    )

    phone: Mapped[str] = mapped_column(String(30))
    city: Mapped[str] = mapped_column(String(100))
    age: Mapped[int] = mapped_column(Integer)

    type: Mapped[UserType] = mapped_column(
        SQLEnum(UserType, name="user_type"),
        default=UserType.CLIENT,
    )

    password_hash: Mapped[str] = mapped_column(String(255))

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
