import uuid
from datetime import date, datetime, timezone

from sqlalchemy import String, Date, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Player(Base):
    """Hockey player profile owned by a parent user."""

    __tablename__ = "players"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    owner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    middle_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    birth_date: Mapped[date] = mapped_column(Date)
    position: Mapped[str] = mapped_column(String(20))
    shooting_hand: Mapped[str] = mapped_column(String(10))
    city: Mapped[str] = mapped_column(String(100))
    region: Mapped[str] = mapped_column(String(100))
    team: Mapped[str | None] = mapped_column(String(200), nullable=True)
    jersey_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hockey_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    photo_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=_utcnow, onupdate=_utcnow
    )

    owner: Mapped["User"] = relationship(back_populates="players")  # noqa: F821
    anthropometrics: Mapped["Anthropometrics | None"] = relationship(
        back_populates="player", uselist=False, cascade="all, delete-orphan"
    )
    test_sessions: Mapped[list["PhysicalTestSession"]] = relationship(
        back_populates="player", cascade="all, delete-orphan"
    )
    videos: Mapped[list["Video"]] = relationship(  # noqa: F821
        back_populates="player", cascade="all, delete-orphan"
    )
    anthro_snapshots: Mapped[list["AnthroSnapshot"]] = relationship(
        back_populates="player",
        cascade="all, delete-orphan",
        order_by="AnthroSnapshot.recorded_at",
    )
    injuries: Mapped[list["Injury"]] = relationship(  # noqa: F821
        back_populates="player", cascade="all, delete-orphan"
    )
    game_stats: Mapped[list["GameStat"]] = relationship(  # noqa: F821
        back_populates="player", cascade="all, delete-orphan"
    )
    video_clips: Mapped[list["VideoClip"]] = relationship(  # noqa: F821
        back_populates="player", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(  # noqa: F821
        back_populates="player", cascade="all, delete-orphan"
    )
    data_entries: Mapped[list["DataEntry"]] = relationship(  # noqa: F821
        back_populates="player", cascade="all, delete-orphan"
    )


class Anthropometrics(Base):
    """One-to-one anthropometric measurements for a player."""

    __tablename__ = "anthropometrics"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("players.id"), unique=True
    )
    height: Mapped[float] = mapped_column(Float)
    weight: Mapped[float] = mapped_column(Float)
    arm_span: Mapped[float] = mapped_column(Float)
    leg_length: Mapped[float] = mapped_column(Float)
    torso_length: Mapped[float] = mapped_column(Float)
    sitting_height: Mapped[float] = mapped_column(Float)
    shoulder_width: Mapped[float] = mapped_column(Float)
    shoe_size: Mapped[float] = mapped_column(Float)
    body_fat_pct: Mapped[float | None] = mapped_column(Float, nullable=True)

    player: Mapped["Player"] = relationship(back_populates="anthropometrics")


class PhysicalTestSession(Base):
    """A recorded physical test session for a player."""

    __tablename__ = "physical_test_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("players.id"), index=True
    )
    recorded_at: Mapped[datetime] = mapped_column(default=_utcnow)
    category: Mapped[str] = mapped_column(String(20), default="off_ice")
    test_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    sprint_20m_fwd: Mapped[float | None] = mapped_column(Float, nullable=True)
    sprint_20m_bwd: Mapped[float | None] = mapped_column(Float, nullable=True)
    sprint_60m: Mapped[float | None] = mapped_column(Float, nullable=True)
    standing_jump: Mapped[float | None] = mapped_column(Float, nullable=True)
    long_jump: Mapped[float | None] = mapped_column(Float, nullable=True)
    agility: Mapped[float | None] = mapped_column(Float, nullable=True)
    flexibility: Mapped[float | None] = mapped_column(Float, nullable=True)
    push_ups: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pull_ups: Mapped[int | None] = mapped_column(Integer, nullable=True)
    plank_sec: Mapped[float | None] = mapped_column(Float, nullable=True)
    balance_test_sec: Mapped[float | None] = mapped_column(Float, nullable=True)

    player: Mapped["Player"] = relationship(back_populates="test_sessions")


class AnthroSnapshot(Base):
    __tablename__ = "anthro_snapshots"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("players.id"), index=True
    )
    recorded_at: Mapped[datetime] = mapped_column(default=_utcnow)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    body_fat_pct: Mapped[float | None] = mapped_column(Float, nullable=True)

    player: Mapped["Player"] = relationship(back_populates="anthro_snapshots")
