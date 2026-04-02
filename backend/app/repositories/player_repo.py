from datetime import date, timedelta

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.player import Player, Anthropometrics, PhysicalTestSession


async def create_player(db: AsyncSession, player: Player) -> Player:
    """Insert a new player with anthropometrics."""
    db.add(player)
    await db.commit()
    await db.refresh(player, attribute_names=["anthropometrics"])
    return player


async def get_player_by_id(db: AsyncSession, player_id: str) -> Player | None:
    """Get player with anthropometrics loaded."""
    result = await db.execute(
        select(Player)
        .options(selectinload(Player.anthropometrics))
        .where(Player.id == player_id)
    )
    return result.scalar_one_or_none()


async def list_players(
    db: AsyncSession,
    *,
    region: str | None = None,
    position: str | None = None,
    age_min: int | None = None,
    age_max: int | None = None,
) -> list[Player]:
    """List players with optional filters."""
    query = select(Player).options(selectinload(Player.anthropometrics))

    if region:
        query = query.where(Player.region == region)
    if position:
        query = query.where(Player.position == position)
    if age_min is not None:
        max_birth = date.today() - timedelta(days=age_min * 365)
        query = query.where(Player.birth_date <= max_birth)
    if age_max is not None:
        min_birth = date.today() - timedelta(days=(age_max + 1) * 365)
        query = query.where(Player.birth_date > min_birth)

    result = await db.execute(query.order_by(Player.rating.desc()))
    return list(result.scalars().all())


async def update_player(db: AsyncSession, player: Player) -> Player:
    """Update existing player."""
    await db.commit()
    await db.refresh(player, attribute_names=["anthropometrics"])
    return player


async def delete_player(db: AsyncSession, player: Player) -> None:
    """Delete a player."""
    await db.delete(player)
    await db.commit()


async def create_test_session(
    db: AsyncSession, session: PhysicalTestSession
) -> PhysicalTestSession:
    """Insert a new physical test session."""
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def list_test_sessions(
    db: AsyncSession, player_id: str
) -> list[PhysicalTestSession]:
    """List all test sessions for a player, newest first."""
    result = await db.execute(
        select(PhysicalTestSession)
        .where(PhysicalTestSession.player_id == player_id)
        .order_by(PhysicalTestSession.recorded_at.desc())
    )
    return list(result.scalars().all())


async def get_regional_rank(
    db: AsyncSession, player: Player
) -> tuple[int, int]:
    """Return (rank, total) for a player within their region."""
    total_q = await db.execute(
        select(func.count()).where(Player.region == player.region)
    )
    total = total_q.scalar() or 0

    rank_q = await db.execute(
        select(func.count()).where(
            Player.region == player.region,
            Player.rating > player.rating,
        )
    )
    rank = (rank_q.scalar() or 0) + 1
    return rank, total
