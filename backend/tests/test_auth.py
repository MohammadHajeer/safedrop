from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from uuid import UUID

from sqlalchemy import select

from app.core.security import hash_refresh_token
from app.models.refresh_token import RefreshToken

register_payload = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "Password123",
}


def test_register_user(client: TestClient) -> None:
    response = client.post("/register", json=register_payload)

    assert response.status_code == 201

    data = response.json()

    assert data["access_token"]
    assert data["token_type"] == "bearer"

    assert data["user"]["first_name"] == "John"
    assert data["user"]["last_name"] == "Doe"
    assert data["user"]["email"] == "john@example.com"
    assert data["user"]["type"] == "client"


def test_register_duplicate_email(client: TestClient) -> None:
    first_response = client.post("/register", json=register_payload)

    assert first_response.status_code == 201

    second_response = client.post("/register", json=register_payload)

    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "Email already registered"


def test_register_creates_refresh_session(
    client: TestClient,
    db: Session,
) -> None:
    response = client.post("/register", json=register_payload)

    assert response.status_code == 201

    user_id = UUID(response.json()["user"]["id"])

    refresh_session = db.scalar(
        select(RefreshToken).where(RefreshToken.user_id == user_id)
    )

    assert refresh_session is not None
    assert refresh_session.revoked_at is None

    raw_refresh_token = client.cookies.get("refresh_token")

    assert raw_refresh_token is not None

    assert hash_refresh_token(raw_refresh_token) == refresh_session.token_hash


def test_login_user(client: TestClient) -> None:
    # Arrange: first create a user
    register_response = client.post("/register", json=register_payload)

    assert register_response.status_code == 201

    # Act: login
    response = client.post(
        "/login",
        data={
            "username": "john@example.com",
            "password": "Password123",
        },
    )

    # Assert
    assert response.status_code == 200

    data = response.json()

    assert data["access_token"]
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "john@example.com"
    assert data["user"]["type"] == "client"


def test_login_wrong_password(client: TestClient) -> None:
    # Arrange: first create a user
    register_response = client.post("/register", json=register_payload)

    assert register_response.status_code == 201

    # Act: login
    response = client.post(
        "/login",
        data={
            "username": "john@example.com",
            "password": "Password",
        },
    )

    # Assert
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_unknown_email(client: TestClient) -> None:

    response = client.post(
        "/login",
        data={
            "username": "john@example.com",
            "password": "Password",
        },
    )

    # Assert
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_get_current_user(client: TestClient) -> None:

    register_response = client.post("/register", json=register_payload)
    assert register_response.status_code == 201

    access_token = register_response.json()["access_token"]

    get_current_user_response = client.get(
        "/users/me", headers={"Authorization": f"Bearer {access_token}"}
    )
    assert get_current_user_response.status_code == 200


def test_get_current_user_without_token(client: TestClient) -> None:
    get_current_user_response = client.get("/users/me")
    assert get_current_user_response.status_code == 401


def test_refresh_access_token(client: TestClient, db: Session) -> None:
    register_response = client.post("/register", json=register_payload)
    assert register_response.status_code == 201

    old_refresh_token = client.cookies.get("refresh_token")
    assert old_refresh_token is not None

    old_token_hash = hash_refresh_token(old_refresh_token)

    response = client.post("/refresh")

    assert response.status_code == 200
    assert response.json()["access_token"]

    new_refresh_token = client.cookies.get("refresh_token")

    assert new_refresh_token is not None
    assert new_refresh_token != old_refresh_token

    old_session = db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == old_token_hash)
    )

    assert old_session is not None
    assert old_session.revoked_at is not None

    new_session = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_refresh_token(new_refresh_token)
        )
    )

    assert new_session is not None
    assert new_session.revoked_at is None


def test_refresh_without_cookie(client: TestClient) -> None:
    response = client.post("/refresh")

    assert response.status_code == 401


def test_logout_revokes_refresh_session(
    client: TestClient,
    db: Session,
) -> None:
    register_response = client.post("/register", json=register_payload)
    assert register_response.status_code == 201

    refresh_token = client.cookies.get("refresh_token")
    assert refresh_token is not None

    token_hash = hash_refresh_token(refresh_token)

    response = client.post("/logout")

    assert response.status_code == 200

    refresh_session = db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )

    assert refresh_session is not None
    assert refresh_session.revoked_at is not None

    assert client.cookies.get("refresh_token") is None


def test_refresh_after_logout_fails(client: TestClient) -> None:
    register_response = client.post("/register", json=register_payload)
    assert register_response.status_code == 201

    logout_response = client.post("/logout")
    assert logout_response.status_code == 200

    refresh_response = client.post("/refresh")

    assert refresh_response.status_code == 401
