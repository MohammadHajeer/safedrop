from datetime import datetime
from typing import TYPE_CHECKING, ClassVar
from uuid import UUID, uuid4

from app.db.base import Base
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.drop_file import DropFile
    from app.models.user import User


class Drop(Base):
    __tablename__ = "drops"
    __table_args__: ClassVar[dict[str, str]] = {
        "schema": "public",
    }

    owner: Mapped["User | None"] = relationship(
        back_populates="created_drops",
    )

    files: Mapped[list["DropFile"]] = relationship(
        back_populates="drop",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    owner_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("public.users.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )

    title: Mapped[str] = mapped_column(
        String(100),
    )

    content: Mapped[str] = mapped_column(
        Text,
    )

    token_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
    )

    encrypted_token: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    guest_management_token_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    max_views: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    view_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    revoked_at: Mapped[datetime | None] = mapped_column(
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

    last_accessed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
