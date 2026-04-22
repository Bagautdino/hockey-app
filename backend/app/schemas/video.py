from datetime import date, datetime

from pydantic import BaseModel, field_validator


class VideoResponse(BaseModel):
    """Video metadata response."""

    id: str
    player_id: str
    title: str
    video_url: str | None = None
    thumbnail_url: str | None = None
    duration_sec: int | None = None
    skill_tag: str | None = None
    status: str
    uploaded_at: str
    rating: int | None = None
    assessment_date: str | None = None
    comment: str | None = None
    training_plan: str | None = None
    is_assessment: bool = False

    model_config = {"from_attributes": True}

    @field_validator("uploaded_at", mode="before")
    @classmethod
    def _coerce_uploaded_at(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    @field_validator("assessment_date", mode="before")
    @classmethod
    def _coerce_assessment_date(cls, v):
        if isinstance(v, date) and not isinstance(v, datetime):
            return v.isoformat()
        if isinstance(v, datetime):
            return v.date().isoformat()
        return v


class VideoUploadResponse(BaseModel):
    """Response after successful video upload."""

    id: str
    status: str
    message: str


class VideoLinkCreate(BaseModel):
    """Create video from an external link (YouTube, VK, direct mp4)."""

    title: str
    video_url: str
    skill_tag: str | None = None


class AssessmentCreate(BaseModel):
    title: str
    video_url: str
    rating: int | None = None
    comment: str | None = None
    training_plan: str | None = None
