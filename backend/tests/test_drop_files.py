from datetime import datetime, timedelta, timezone
from uuid import UUID

import httpx
from app.core.config import settings
from app.models.drop_file import DropFile
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_authenticated_file_upload_flow(
    client: TestClient,
    db: Session,
    storage_client,
):
    file_content = b"hello safedrop"
    file_size = len(file_content)

    # 1. Register an authenticated user
    register_response = client.post(
        "/register",
        json={
            "first_name": "File",
            "last_name": "Tester",
            "email": "filetester@example.com",
            "password": "StrongPassword123!",
        },
    )

    assert register_response.status_code == 201

    access_token = register_response.json()["access_token"]

    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    # 2. Create an active Drop
    drop_response = client.post(
        "/drops",
        headers=headers,
        json={
            "title": "File upload test",
            "content": "Testing SafeDrop file uploads.",
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
            "max_views": 5,
        },
    )

    assert drop_response.status_code == 201

    drop_data = drop_response.json()

    drop_id = drop_data["id"]
    share_token = drop_data["share_token"]

    # 3. Ask FastAPI for upload permission
    presign_response = client.post(
        f"/drops/{drop_id}/files/presign",
        headers=headers,
        json={
            "original_name": "test.txt",
            "content_type": "text/plain",
            "size_bytes": file_size,
        },
    )

    assert presign_response.status_code == 201

    presigned = presign_response.json()

    file_id = presigned["file_id"]
    upload_url = presigned["upload_url"]
    fields = presigned["fields"]

    pending_key = f"pending/{drop_id}/{file_id}"
    final_key = f"drops/{drop_id}/{file_id}"

    try:
        # 4. Pretend to be the browser:
        # upload directly to TEST Neon Object Storage
        upload_response = httpx.post(
            upload_url,
            data=fields,
            files={
                "file": (
                    "test.txt",
                    file_content,
                    "text/plain",
                ),
            },
            timeout=30,
        )

        assert upload_response.is_success

        # 5. Tell FastAPI that the upload finished
        complete_response = client.post(
            f"/drops/{drop_id}/files/{file_id}/complete",
            headers=headers,
        )

        assert complete_response.status_code == 200

        completed_file = complete_response.json()

        assert completed_file["id"] == file_id
        assert completed_file["original_name"] == "test.txt"
        assert completed_file["content_type"] == "text/plain"
        assert completed_file["size_bytes"] == file_size
        assert completed_file["uploaded_at"] is not None

        # 6. Verify PostgreSQL was updated
        drop_file = db.get(DropFile, UUID(file_id))

        assert drop_file is not None
        assert drop_file.storage_key == final_key
        assert drop_file.uploaded_at is not None
        assert drop_file.storage_deleted_at is None

        # 7. Verify the final object really exists in TEST storage
        metadata = storage_client.head_object(
            Bucket=settings.test_storage_bucket,
            Key=final_key,
        )

        assert metadata["ContentLength"] == file_size
        assert metadata["ContentType"] == "text/plain"

        # 8. Test that /complete is safe to retry
        retry_response = client.post(
            f"/drops/{drop_id}/files/{file_id}/complete",
            headers=headers,
        )

        assert retry_response.status_code == 200
        assert retry_response.json()["id"] == file_id

        # 9. Recipient opens the Drop using the public share token
        access_response = client.get(
            f"/d/{share_token}",
        )

        assert access_response.status_code == 200

        access_data = access_response.json()

        assert access_data["title"] == "File upload test"
        assert access_data["content"] == "Testing SafeDrop file uploads."

        assert len(access_data["files"]) == 1

        file_data = access_data["files"][0]

        assert file_data["id"] == file_id
        assert file_data["original_name"] == "test.txt"
        assert file_data["content_type"] == "text/plain"
        assert file_data["size_bytes"] == file_size
        assert file_data["download_url"]

        # 10. Download
        download_response = httpx.get(
            file_data["download_url"],
            timeout=30,
        )

        assert download_response.status_code == 200
        assert download_response.content == file_content

    finally:
        # Never leave test objects behind in Neon Storage.
        storage_client.delete_object(
            Bucket=settings.test_storage_bucket,
            Key=pending_key,
        )

        storage_client.delete_object(
            Bucket=settings.test_storage_bucket,
            Key=final_key,
        )
