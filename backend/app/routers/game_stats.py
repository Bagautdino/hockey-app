from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.game_stat import GameStat
from app.models.user import User
from app.schemas.game_stat import GameStatCreate, GameStatResponse, GameStatUpdate
from app.services.auth_service import get_current_user
from app.services import player_service

router = APIRouter(prefix="")


@router.post(
    "/players/{player_id}/game-stats",
    response_model=GameStatResponse,
    status_code=201,
)
async def create_game_stat(
    player_id: str,
    body: GameStatCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    player = await player_service.get_player_or_404(db, player_id)
    player_service.assert_owner(player, user)
    stat = GameStat(player_id=player_id, **body.model_dump())
    db.add(stat)
    await db.commit()
    await db.refresh(stat)
    return stat


@router.get("/players/{player_id}/game-stats", response_model=list[GameStatResponse])
async def list_game_stats(player_id: str, db: AsyncSession = Depends(get_db)):
    await player_service.get_player_or_404(db, player_id)
    result = await db.execute(
        select(GameStat)
        .where(GameStat.player_id == player_id)
        .order_by(GameStat.recorded_at.desc())
    )
    return list(result.scalars().all())


@router.patch("/game-stats/{stat_id}", response_model=GameStatResponse)
async def update_game_stat(
    stat_id: str,
    body: GameStatUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(GameStat).where(GameStat.id == stat_id))
    stat = result.scalar_one_or_none()
    if not stat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статистика не найдена",
        )
    player = await player_service.get_player_or_404(db, stat.player_id)
    player_service.assert_owner(player, user)
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(stat, key, value)
    await db.commit()
    await db.refresh(stat)
    return stat


@router.delete("/game-stats/{stat_id}", status_code=204)
async def delete_game_stat(
    stat_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(GameStat).where(GameStat.id == stat_id))
    stat = result.scalar_one_or_none()
    if not stat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статистика не найдена",
        )
    player = await player_service.get_player_or_404(db, stat.player_id)
    player_service.assert_owner(player, user)
    await db.delete(stat)
    await db.commit()
