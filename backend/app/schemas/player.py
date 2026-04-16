from datetime import date

from pydantic import BaseModel


class AnthropometricsSchema(BaseModel):
    """Anthropometric measurements."""

    height: float
    weight: float
    arm_span: float
    leg_length: float
    torso_length: float
    sitting_height: float
    shoulder_width: float
    shoe_size: float
    body_fat_pct: float | None = None

    model_config = {"from_attributes": True}


class PlayerCreate(BaseModel):
    """Create player request body."""

    first_name: str
    last_name: str
    middle_name: str | None = None
    birth_date: date
    position: str
    shooting_hand: str
    city: str
    region: str
    team: str | None = None
    jersey_number: int | None = None
    anthropometrics: AnthropometricsSchema | None = None


class PlayerUpdate(BaseModel):
    """Update player request body (all optional)."""

    first_name: str | None = None
    last_name: str | None = None
    middle_name: str | None = None
    birth_date: date | None = None
    position: str | None = None
    shooting_hand: str | None = None
    city: str | None = None
    region: str | None = None
    team: str | None = None
    jersey_number: int | None = None
    anthropometrics: AnthropometricsSchema | None = None


class PlayerResponse(BaseModel):
    """Player response with nested anthropometrics."""

    id: str
    owner_id: str
    first_name: str
    last_name: str
    middle_name: str | None = None
    birth_date: date
    position: str
    shooting_hand: str
    city: str
    region: str
    team: str | None = None
    jersey_number: int | None = None
    rating: float
    avatar: str | None = None
    anthropometrics: AnthropometricsSchema | None = None

    model_config = {"from_attributes": True}


class TestSessionCreate(BaseModel):
    """Create physical test session."""

    sprint_20m_fwd: float | None = None
    sprint_20m_bwd: float | None = None
    sprint_60m: float | None = None
    standing_jump: float | None = None
    long_jump: float | None = None
    agility: float | None = None
    flexibility: float | None = None
    push_ups: int | None = None
    pull_ups: int | None = None
    plank_sec: float | None = None
    balance_test_sec: float | None = None


class TestSessionResponse(BaseModel):
    """Physical test session response."""

    id: str
    player_id: str
    recorded_at: str
    sprint_20m_fwd: float | None = None
    sprint_20m_bwd: float | None = None
    sprint_60m: float | None = None
    standing_jump: float | None = None
    long_jump: float | None = None
    agility: float | None = None
    flexibility: float | None = None
    push_ups: int | None = None
    pull_ups: int | None = None
    plank_sec: float | None = None
    balance_test_sec: float | None = None

    model_config = {"from_attributes": True}
