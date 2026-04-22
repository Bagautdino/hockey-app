from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.injury import Injury
from app.models.user import User
from app.schemas.injury import InjuryCreate, InjuryResponse, InjuryUpdate
from app.services.auth_service import get_current_user
from app.services import player_service

router = APIRouter(prefix="")


@router.post(
    "/players/{player_id}/injuries",
    response_model=InjuryResponse,
    status_code=201,
)
async def create_injury(
    player_id: str,
    body: InjuryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    player = await player_service.get_player_or_404(db, player_id)
    player_service.assert_owner(player, user)
    injury = Injury(player_id=player_id, **body.model_dump())
    db.add(injury)
    await db.commit()
    await db.refresh(injury)
    return injury


@router.get("/players/{player_id}/injuries", response_model=list[InjuryResponse])
async def list_injuries(player_id: str, db: AsyncSession = Depends(get_db)):
    await player_service.get_player_or_404(db, player_id)
    result = await db.execute(
        select(Injury)
        .where(Injury.player_id == player_id)
        .order_by(Injury.created_at.desc())
    )
    return list(result.scalars().all())


@router.patch("/injuries/{injury_id}", response_model=InjuryResponse)
async def update_injury(
    injury_id: str,
    body: InjuryUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Injury).where(Injury.id == injury_id))
    injury = result.scalar_one_or_none()
    if not injury:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Травма не найдена",
        )
    player = await player_service.get_player_or_404(db, injury.player_id)
    player_service.assert_owner(player, user)
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(injury, key, value)
    await db.commit()
    await db.refresh(injury)
    return injury


@router.delete("/injuries/{injury_id}", status_code=204)
async def delete_injury(
    injury_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Injury).where(Injury.id == injury_id))
    injury = result.scalar_one_or_none()
    if not injury:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Травма не найдена",
        )
    player = await player_service.get_player_or_404(db, injury.player_id)
    player_service.assert_owner(player, user)
    await db.delete(injury)
    await db.commit()
