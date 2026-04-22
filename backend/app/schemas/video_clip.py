from datetime import datetime

from pydantic import BaseModel, field_validator


class VideoClipCreate(BaseModel):
    title: str
    video_url: str | None = None
    category: str
    position_type: str
    notes: str | None = None


class VideoClipResponse(BaseModel):
    id: str
    player_id: str
    uploader_id: str
    title: str
    s3_key: str | None = None
    video_url: str | None = None
    category: str
    position_type: str
    notes: str | None = None
    uploaded_at: str

    model_config = {"from_attributes": True}

    @field_validator("uploaded_at", mode="before")
    @classmethod
    def _coerce_uploaded_at(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v
