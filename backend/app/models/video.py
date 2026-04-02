import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Video(Base):
    """Uploaded video associated with a player."""

    __tablename__ = "videos"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("players.id"), index=True
    )
    title: Mapped[str] = mapped_column(String(255))
    s3_key: Mapped[str] = mapped_column(String(500))
    thumbnail_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    duration_sec: Mapped[int | None] = mapped_column(Integer, nullable=True)
    skill_tag: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    uploaded_at: Mapped[datetime] = mapped_column(default=_utcnow)

    player: Mapped["Player"] = relationship(back_populates="videos")  # noqa: F821
