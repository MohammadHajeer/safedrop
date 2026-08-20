from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text, delete
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.database import get_db
from app.main import app

from app.models.drop import Drop
from app.models.refresh_token import RefreshToken
from app.models.user import User, UserType

test_engine = create_engine(settings.test_database_url)

TestSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    expire_on_commit=False,
)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    with test_engine.begin() as connection:
        connection.execute(text("CREATE SCHEMA IF NOT EXISTS auth"))

    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)

    with test_engine.begin() as connection:
        connection.execute(text("DROP SCHEMA IF EXISTS auth CASCADE"))


@pytest.fixture
def db() -> Generator[Session, None, None]:
    session = TestSessionLocal()

    try:
        yield session
    finally:
        session.close()

        with TestSessionLocal() as cleanup_db:
            cleanup_db.execute(delete(RefreshToken))
            cleanup_db.execute(delete(Drop))
            cleanup_db.execute(delete(User))
            cleanup_db.commit()


@pytest.fixture
def client(db: Session):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def admin_headers(
    client: TestClient,
    db: Session,
) -> dict[str, str]:
    admin = User(
        first_name="Admin",
        last_name="User",
        email="admin@example.com",
        password_hash=hash_password("Password123"),
        type=UserType.ADMIN,
    )

    db.add(admin)
    db.commit()

    response = client.post(
        "/login",
        data={
            "username": "admin@example.com",
            "password": "Password123",
        },
    )

    assert response.status_code == 200

    access_token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {access_token}",
    }


@pytest.fixture
def client_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/register",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "password": "Password123",
        },
    )

    assert response.status_code == 201

    access_token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {access_token}",
    }
