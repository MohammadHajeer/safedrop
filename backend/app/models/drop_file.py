from datetime import datetime
from typing import TYPE_CHECKING, ClassVar
from uuid import UUID, uuid4

from app.db.base import Base
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.drop import Drop


class DropFile(Base):
    __tablename__ = "drop_files"
    __table_args__: ClassVar[dict[str, str]] = {
        "schema": "public",
    }

    drop: Mapped["Drop"] = relationship(
        back_populates="files",
    )

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    drop_id: Mapped[UUID] = mapped_column(
        ForeignKey("public.drops.id", ondelete="CASCADE"),
        index=True,
    )

    original_name: Mapped[str] = mapped_column(
        String(255),
    )

    storage_key: Mapped[str] = mapped_column(
        String(500),
        unique=True,
    )

    content_type: Mapped[str] = mapped_column(
        String(255),
    )

    size_bytes: Mapped[int] = mapped_column(
        BigInteger,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    uploaded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    storage_deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
