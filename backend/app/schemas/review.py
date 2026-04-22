from datetime import datetime

from pydantic import BaseModel, field_validator


class ReviewCreate(BaseModel):
    content: str
    author_role: str


class ReviewResponse(BaseModel):
    id: str
    player_id: str
    author_id: str
    content: str
    author_role: str
    created_at: str

    model_config = {"from_attributes": True}

    @field_validator("created_at", mode="before")
    @classmethod
    def _coerce_created_at(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v


class DataEntryVerify(BaseModel):
    pass


class DataEntryResponse(BaseModel):
    id: str
    player_id: str
    entered_by_id: str
    entry_type: str
    entry_id: str
    entered_by_role: str
    verified_by_id: str | None = None
    verified_at: str | None = None
    created_at: str

    model_config = {"from_attributes": True}

    @field_validator("verified_at", "created_at", mode="before")
    @classmethod
    def _coerce_datetimes(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v
