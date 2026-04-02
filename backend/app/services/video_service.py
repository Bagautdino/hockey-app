import uuid

import boto3
from botocore.config import Config as BotoConfig
from botocore.exceptions import ClientError
from fastapi import HTTPException, status

from app.config import settings


def get_s3_client():
    """Create a boto3 S3 client for MinIO."""
    return boto3.client(
        "s3",
        endpoint_url=f"{'https' if settings.MINIO_USE_SSL else 'http'}://{settings.MINIO_ENDPOINT}",
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=BotoConfig(signature_version="s3v4"),
        region_name="us-east-1",
    )


def upload_to_s3(file_bytes: bytes, filename: str) -> str:
    """Upload bytes to S3 and return the object key."""
    s3 = get_s3_client()
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "mp4"
    key = f"videos/{uuid.uuid4()}.{ext}"
    try:
        s3.put_object(
            Bucket=settings.MINIO_BUCKET,
            Key=key,
            Body=file_bytes,
            ContentType=f"video/{ext}",
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Ошибка загрузки в хранилище",
        ) from e
    return key


def get_presigned_url(key: str, expires_in: int = 3600) -> str:
    """Generate a presigned URL for an S3 object."""
    s3 = get_s3_client()
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.MINIO_BUCKET, "Key": key},
        ExpiresIn=expires_in,
    )
