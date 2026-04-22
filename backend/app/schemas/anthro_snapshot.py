from datetime import datetime

from pydantic import BaseModel, field_validator


class AnthroSnapshotCreate(BaseModel):
    height: float | None = None
    weight: float | None = None
    body_fat_pct: float | None = None


class AnthroSnapshotResponse(BaseModel):
    id: str
    player_id: str
    recorded_at: str
    height: float | None = None
    weight: float | None = None
    body_fat_pct: float | None = None

    model_config = {"from_attributes": True}

    @field_validator("recorded_at", mode="before")
    @classmethod
    def _coerce_recorded_at(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v
