import uuid
from datetime import date, datetime, timezone

from sqlalchemy import String, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class GameStat(Base):
    __tablename__ = "game_stats"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("players.id"), index=True
    )
    season: Mapped[str] = mapped_column(String(20))
    competition_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    games_played: Mapped[int] = mapped_column(Integer, default=0)
    goals: Mapped[int | None] = mapped_column(Integer, nullable=True)
    assists: Mapped[int | None] = mapped_column(Integer, nullable=True)
    points: Mapped[int | None] = mapped_column(Integer, nullable=True)
    plus_minus: Mapped[int | None] = mapped_column(Integer, nullable=True)
    penalty_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    goals_against_avg: Mapped[float | None] = mapped_column(Float, nullable=True)
    save_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    shutouts: Mapped[int | None] = mapped_column(Integer, nullable=True)
    recorded_at: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=_utcnow, onupdate=_utcnow
    )

    player: Mapped["Player"] = relationship(back_populates="game_stats")  # noqa: F821
