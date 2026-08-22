from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, Field

FileName = Annotated[str, Field(min_length=1, max_length=255)]
ContentType = Annotated[str, Field(min_length=1, max_length=255)]
FileSize = Annotated[int, Field(gt=0)]


class FileUploadRequest(BaseModel):
    original_name: FileName
    content_type: ContentType
    size_bytes: FileSize


class FileUploadResponse(BaseModel):
    file_id: UUID
    upload_url: str
    fields: dict[str, str]
    expires_in: int


class DropFileOut(BaseModel):
    id: UUID
    original_name: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime

    model_config = {
        "from_attributes": True,
    }


class DropAccessFile(BaseModel):
    id: UUID
    original_name: str
    content_type: str
    size_bytes: int
    download_url: str
