from datetime import datetime, timedelta, timezone

from app.core.security import hash_password
from app.core.storage_limits import USER_MAX_ACTIVE_STORAGE
from app.models.drop import Drop
from app.models.drop_file import DropFile
from app.models.user import User
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def make_drop(db: Session, owner: User, suffix: str, **overrides) -> Drop:
    values = {
        "owner_id": owner.id,
        "title": f"Drop {suffix}",
        "content": "Phase 2 test content",
        "token_hash": f"token-{suffix}",
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        "max_views": 5,
        "view_count": 0,
    }
    values.update(overrides)
    drop = Drop(**values)
    db.add(drop)
    db.flush()
    return drop


def make_file(db: Session, drop: Drop, suffix: str, size: int, **overrides) -> DropFile:
    values = {
        "drop_id": drop.id,
        "original_name": f"{suffix}.txt",
        "storage_key": f"test/{drop.id}/{suffix}",
        "content_type": "text/plain",
        "size_bytes": size,
        "uploaded_at": datetime.now(timezone.utc),
    }
    values.update(overrides)
    file = DropFile(**values)
    db.add(file)
    db.flush()
    return file


def test_owner_file_list_only_returns_finalized_available_files(
    client: TestClient,
    db: Session,
    client_headers: dict[str, str],
):
    owner = db.query(User).filter_by(email="john@example.com").one()
    drop = make_drop(db, owner, "owner-files")
    finalized = make_file(db, drop, "finalized", 100)
    make_file(db, drop, "pending", 200, uploaded_at=None)
    make_file(
        db,
        drop,
        "deleted",
        300,
        storage_deleted_at=datetime.now(timezone.utc),
    )
    other = make_file(db, drop, "second", 400)
    db.commit()

    response = client.get(f"/drops/{drop.id}/files", headers=client_headers)

    assert response.status_code == 200
    payload = response.json()
    assert {item["id"] for item in payload} == {str(finalized.id), str(other.id)}
    assert len(payload) == 2
    assert all("storage_key" not in item for item in payload)


def test_another_user_cannot_list_owner_files(
    client: TestClient,
    db: Session,
    client_headers: dict[str, str],
):
    other_user = User(
        first_name="Other",
        last_name="Owner",
        email="other-owner@example.com",
        password_hash=hash_password("Password123"),
    )
    db.add(other_user)
    db.flush()
    drop = make_drop(db, other_user, "private-files")
    make_file(db, drop, "private", 100)
    db.commit()

    response = client.get(f"/drops/{drop.id}/files", headers=client_headers)

    assert response.status_code == 404


def test_storage_usage_matches_active_quota_semantics(
    client: TestClient,
    db: Session,
    client_headers: dict[str, str],
):
    owner = db.query(User).filter_by(email="john@example.com").one()
    other_user = User(
        first_name="Other",
        last_name="User",
        email="other-storage@example.com",
        password_hash=hash_password("Password123"),
    )
    db.add(other_user)
    db.flush()

    active = make_drop(db, owner, "active")
    make_file(db, active, "active-final", 2_000_000)
    make_file(db, active, "active-pending", 1_000_000, uploaded_at=None)
    make_file(
        db,
        active,
        "active-deleted",
        8_000_000,
        storage_deleted_at=datetime.now(timezone.utc),
    )

    expired = make_drop(
        db,
        owner,
        "expired",
        expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
    )
    make_file(db, expired, "expired-file", 4_000_000)

    revoked = make_drop(
        db,
        owner,
        "revoked",
        revoked_at=datetime.now(timezone.utc),
    )
    make_file(db, revoked, "revoked-file", 5_000_000)

    consumed = make_drop(db, owner, "consumed", max_views=1, view_count=1)
    make_file(db, consumed, "consumed-file", 6_000_000)

    other_drop = make_drop(db, other_user, "other-user")
    make_file(db, other_drop, "other-file", 7_000_000)
    db.commit()

    response = client.get("/stats/me/storage", headers=client_headers)

    assert response.status_code == 200
    payload = response.json()
    expected_used = 3_000_000
    assert payload["used_bytes"] == expected_used
    assert payload["limit_bytes"] == USER_MAX_ACTIVE_STORAGE
    assert payload["remaining_bytes"] == USER_MAX_ACTIVE_STORAGE - expected_used
    assert payload["percentage"] == (expected_used / USER_MAX_ACTIVE_STORAGE) * 100
