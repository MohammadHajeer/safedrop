from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.storage_limits import PLATFORM_MAX_STORAGE
from app.db.base import Base
from app.models.drop import Drop
from app.models.drop_file import DropFile
from app.models.user import User, UserType
from app.routers.stats import get_admin_storage_usage


def test_admin_platform_storage_counts_uncleaned_physical_objects() -> None:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        execution_options={
            "schema_translate_map": {"public": None, "auth": None}
        },
    )
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        now = datetime.now(timezone.utc)
        admin = User(
            first_name="Test",
            last_name="Admin",
            email="admin-storage@example.com",
            password_hash="not-used",
            type=UserType.ADMIN,
        )
        db.add(admin)
        db.flush()
        active_drop = Drop(
            owner_id=admin.id,
            title="Active storage",
            content="Active",
            token_hash=f"storage-active-{uuid4()}",
            expires_at=now + timedelta(hours=1),
            max_views=2,
        )
        terminal_drop = Drop(
            owner_id=admin.id,
            title="Expired storage",
            content="Expired but not cleaned",
            token_hash=f"storage-terminal-{uuid4()}",
            expires_at=now - timedelta(hours=1),
            max_views=1,
        )
        db.add_all([active_drop, terminal_drop])
        db.flush()
        db.add_all(
            [
                DropFile(
                    drop_id=active_drop.id,
                    original_name="active.bin",
                    storage_key=f"drops/{active_drop.id}/active",
                    content_type="application/octet-stream",
                    size_bytes=256,
                    uploaded_at=now,
                ),
                DropFile(
                    drop_id=terminal_drop.id,
                    original_name="terminal.bin",
                    storage_key=f"drops/{terminal_drop.id}/terminal",
                    content_type="application/octet-stream",
                    size_bytes=512,
                    uploaded_at=now,
                ),
                DropFile(
                    drop_id=terminal_drop.id,
                    original_name="cleaned.bin",
                    storage_key=f"drops/{terminal_drop.id}/cleaned",
                    content_type="application/octet-stream",
                    size_bytes=1024,
                    uploaded_at=now,
                    storage_deleted_at=now,
                ),
            ]
        )
        db.commit()

        result = get_admin_storage_usage(admin_user=admin, db=db)

        assert result.used_bytes == 768
        assert result.limit_bytes == PLATFORM_MAX_STORAGE
        assert result.remaining_bytes == PLATFORM_MAX_STORAGE - 768
        assert result.percentage == 768 / PLATFORM_MAX_STORAGE * 100

    Base.metadata.drop_all(engine)

