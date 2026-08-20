from uuid import UUID

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken
from app.models.user import User

client_payload = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "type": "client",
}


def test_client_cannot_list_users(client: TestClient) -> None:
    register_response = client.post(
        "/register",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "password": "Password123",
        },
    )

    assert register_response.status_code == 201

    access_token = register_response.json()["access_token"]

    response = client.get(
        "/users",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 403


def test_admin_can_list_users(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    response = client.get(
        "/users",
        headers=admin_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data


def test_admin_can_create_client(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    response = client.post(
        "/users",
        json=client_payload,
        headers=admin_headers,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["email"] == "john@example.com"
    assert data["type"] == "client"


def test_admin_can_create_admin(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    response = client.post(
        "/users",
        json={
            "first_name": "Second",
            "last_name": "Admin",
            "email": "admin2@example.com",
            "password": "Password123",
            "type": "admin",
        },
        headers=admin_headers,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == "admin2@example.com"
    assert data["type"] == "admin"


def test_admin_user_list_pagination(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    for index in range(3):
        response = client.post(
            "/users",
            json={
                "first_name": f"User{index}",
                "last_name": "Test",
                "email": f"user{index}@example.com",
                "password": "Password123",
                "type": "client",
            },
            headers=admin_headers,
        )

        assert response.status_code == 201

    response = client.get(
        "/users?page=1&page_size=2",
        headers=admin_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 3
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert len(data["items"]) == 2


def test_admin_can_search_users(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    first_response = client.post(
        "/users",
        json={
            "first_name": "Mahmoud",
            "last_name": "Khalil",
            "email": "mahmoud@example.com",
            "password": "Password123",
            "type": "client",
        },
        headers=admin_headers,
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/users",
        json={
            "first_name": "Ahmad",
            "last_name": "Saleh",
            "email": "ahmad@example.com",
            "password": "Password123",
            "type": "client",
        },
        headers=admin_headers,
    )

    assert second_response.status_code == 201

    response = client.get(
        "/users?search=mahmoud",
        headers=admin_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["email"] == "mahmoud@example.com"


def test_admin_can_filter_users_by_type(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    client_response = client.post(
        "/users",
        json={
            "first_name": "Client",
            "last_name": "User",
            "email": "client@example.com",
            "password": "Password123",
            "type": "client",
        },
        headers=admin_headers,
    )

    assert client_response.status_code == 201

    admin_response = client.post(
        "/users",
        json={
            "first_name": "Other",
            "last_name": "Admin",
            "email": "otheradmin@example.com",
            "password": "Password123",
            "type": "admin",
        },
        headers=admin_headers,
    )

    assert admin_response.status_code == 201

    response = client.get(
        "/users?user_type=client",
        headers=admin_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert data["items"][0]["type"] == "client"


def test_admin_can_update_user(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    create_response = client.post(
        "/users",
        json=client_payload,
        headers=admin_headers,
    )

    assert create_response.status_code == 201

    user_id = create_response.json()["id"]

    response = client.put(
        f"/users/{user_id}",
        json={
            "first_name": "Updated",
            "email": "updated@example.com",
        },
        headers=admin_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["first_name"] == "Updated"
    assert data["email"] == "updated@example.com"
    assert data["last_name"] == "Doe"


def test_admin_can_soft_delete_user(
    client: TestClient,
    admin_headers: dict[str, str],
    db: Session,
) -> None:
    create_response = client.post(
        "/users",
        json=client_payload,
        headers=admin_headers,
    )

    assert create_response.status_code == 201

    user_id = UUID(create_response.json()["id"])

    response = client.delete(
        f"/users/{user_id}",
        headers=admin_headers,
    )

    assert response.status_code == 204

    user = db.scalar(select(User).where(User.id == user_id))

    assert user is not None
    assert user.deleted_at is not None


def test_deleted_user_cannot_login(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    create_response = client.post(
        "/users",
        json=client_payload,
        headers=admin_headers,
    )

    assert create_response.status_code == 201

    user_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/users/{user_id}",
        headers=admin_headers,
    )

    assert delete_response.status_code == 204

    login_response = client.post(
        "/login",
        data={
            "username": "john@example.com",
            "password": "Password123",
        },
    )

    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Invalid email or password"


def test_deleting_user_revokes_refresh_sessions(
    client: TestClient,
    admin_headers: dict[str, str],
    db: Session,
) -> None:
    create_response = client.post(
        "/users",
        json=client_payload,
        headers=admin_headers,
    )

    assert create_response.status_code == 201

    user_id = UUID(create_response.json()["id"])

    login_response = client.post(
        "/login",
        data={
            "username": "john@example.com",
            "password": "Password123",
        },
    )

    assert login_response.status_code == 200

    refresh_session = db.scalar(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None),
        )
    )

    assert refresh_session is not None
    assert refresh_session.revoked_at is None

    delete_response = client.delete(
        f"/users/{user_id}",
        headers=admin_headers,
    )

    assert delete_response.status_code == 204

    db.refresh(refresh_session)

    assert refresh_session.revoked_at is not None
