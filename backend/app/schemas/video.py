from pydantic import BaseModel


class VideoResponse(BaseModel):
    """Video metadata response."""

    id: str
    player_id: str
    title: str
    thumbnail_url: str | None = None
    duration_sec: int | None = None
    skill_tag: str | None = None
    status: str
    uploaded_at: str

    model_config = {"from_attributes": True}


class VideoUploadResponse(BaseModel):
    """Response after successful video upload."""

    id: str
    status: str
    message: str
