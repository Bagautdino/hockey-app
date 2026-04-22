from datetime import date, datetime

from pydantic import BaseModel, field_validator


class InjuryCreate(BaseModel):
    name: str
    description: str | None = None
    injury_date: date
    recovery_days: int | None = None
    status: str = "in_progress"
    notes: str | None = None


class InjuryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    recovery_days: int | None = None
    status: str | None = None
    notes: str | None = None


class InjuryResponse(BaseModel):
    id: str
    player_id: str
    name: str
    description: str | None = None
    injury_date: date
    recovery_days: int | None = None
    status: str
    notes: str | None = None
    created_at: str

    model_config = {"from_attributes": True}

    @field_validator("created_at", mode="before")
    @classmethod
    def _coerce_created_at(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v
