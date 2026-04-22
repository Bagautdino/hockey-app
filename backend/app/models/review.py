import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("players.id"), index=True
    )
    author_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    content: Mapped[str] = mapped_column(Text)
    author_role: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)

    player: Mapped["Player"] = relationship(back_populates="reviews")  # noqa: F821
    author: Mapped["User"] = relationship()  # noqa: F821


class DataEntry(Base):
    __tablename__ = "data_entries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("players.id"), index=True
    )
    entered_by_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    entry_type: Mapped[str] = mapped_column(String(50))
    entry_id: Mapped[str] = mapped_column(String(36))
    entered_by_role: Mapped[str] = mapped_column(String(20))
    verified_by_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    verified_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)

    player: Mapped["Player"] = relationship(back_populates="data_entries")  # noqa: F821
    entered_by: Mapped["User"] = relationship(foreign_keys=[entered_by_id])  # noqa: F821
    verified_by: Mapped["User | None"] = relationship(  # noqa: F821
        foreign_keys=[verified_by_id]
    )
