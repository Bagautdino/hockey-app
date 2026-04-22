from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.player import AnthroSnapshot
from app.models.user import User
from app.schemas.anthro_snapshot import AnthroSnapshotCreate, AnthroSnapshotResponse
from app.services.auth_service import get_current_user
from app.services import player_service

router = APIRouter(prefix="")


@router.post(
    "/players/{player_id}/anthro-snapshots",
    response_model=AnthroSnapshotResponse,
    status_code=201,
)
async def create_anthro_snapshot(
    player_id: str,
    body: AnthroSnapshotCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    player = await player_service.get_player_or_404(db, player_id)
    player_service.assert_owner(player, user)
    snap = AnthroSnapshot(player_id=player_id, **body.model_dump(exclude_unset=True))
    db.add(snap)
    await db.commit()
    await db.refresh(snap)
    return snap


@router.get(
    "/players/{player_id}/anthro-snapshots",
    response_model=list[AnthroSnapshotResponse],
)
async def list_anthro_snapshots(
    player_id: str,
    days: int | None = Query(None, ge=1),
    db: AsyncSession = Depends(get_db),
):
    await player_service.get_player_or_404(db, player_id)
    q = select(AnthroSnapshot).where(AnthroSnapshot.player_id == player_id)
    if days is not None:
        cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(
            days=days
        )
        q = q.where(AnthroSnapshot.recorded_at >= cutoff)
    q = q.order_by(AnthroSnapshot.recorded_at.desc())
    result = await db.execute(q)
    return list(result.scalars().all())
