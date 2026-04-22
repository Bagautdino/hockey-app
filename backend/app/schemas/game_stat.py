from datetime import date

from pydantic import BaseModel


class GameStatCreate(BaseModel):
    season: str
    competition_name: str | None = None
    games_played: int = 0
    goals: int | None = None
    assists: int | None = None
    points: int | None = None
    plus_minus: int | None = None
    penalty_minutes: int | None = None
    goals_against_avg: float | None = None
    save_pct: float | None = None
    shutouts: int | None = None
    recorded_at: date


class GameStatUpdate(BaseModel):
    season: str | None = None
    competition_name: str | None = None
    games_played: int | None = None
    goals: int | None = None
    assists: int | None = None
    points: int | None = None
    plus_minus: int | None = None
    penalty_minutes: int | None = None
    goals_against_avg: float | None = None
    save_pct: float | None = None
    shutouts: int | None = None


class GameStatResponse(BaseModel):
    id: str
    player_id: str
    season: str
    competition_name: str | None = None
    games_played: int
    goals: int | None = None
    assists: int | None = None
    points: int | None = None
    plus_minus: int | None = None
    penalty_minutes: int | None = None
    goals_against_avg: float | None = None
    save_pct: float | None = None
    shutouts: int | None = None
    recorded_at: date

    model_config = {"from_attributes": True}
