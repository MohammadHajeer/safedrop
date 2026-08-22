import boto3
from app.core.config import settings


def get_storage_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.aws_endpoint_url_s3,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region,
    )


def create_presigned_upload(
    storage_key: str,
    content_type: str,
    max_size: int,
    expires_in: int = 300,
) -> dict:
    client = get_storage_client()

    return client.generate_presigned_post(
        Bucket=settings.storage_bucket,
        Key=storage_key,
        Fields={
            "Content-Type": content_type,
        },
        Conditions=[
            {"Content-Type": content_type},
            ["content-length-range", 1, max_size],
        ],
        ExpiresIn=expires_in,
    )


from botocore.exceptions import ClientError


def get_file_metadata(storage_key: str) -> dict | None:
    client = get_storage_client()

    try:
        return client.head_object(
            Bucket=settings.storage_bucket,
            Key=storage_key,
        )
    except ClientError as exc:
        status_code = exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode")

        if status_code == 404:
            return None

        raise


def delete_file(storage_key: str) -> None:
    client = get_storage_client()

    client.delete_object(
        Bucket=settings.storage_bucket,
        Key=storage_key,
    )


def promote_file(
    temporary_key: str,
    final_key: str,
) -> None:
    client = get_storage_client()

    client.copy_object(
        Bucket=settings.storage_bucket,
        CopySource={
            "Bucket": settings.storage_bucket,
            "Key": temporary_key,
        },
        Key=final_key,
    )

    client.delete_object(
        Bucket=settings.storage_bucket,
        Key=temporary_key,
    )
