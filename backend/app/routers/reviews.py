from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.review import DataEntry, Review
from app.models.user import User
from app.schemas.review import (
    DataEntryResponse,
    DataEntryVerify,
    ReviewCreate,
    ReviewResponse,
)
from app.services.auth_service import get_current_user
from app.services import player_service

router = APIRouter(prefix="")


def _utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


@router.post(
    "/players/{player_id}/reviews",
    response_model=ReviewResponse,
    status_code=201,
)
async def create_review(
    player_id: str,
    body: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await player_service.get_player_or_404(db, player_id)
    review = Review(
        player_id=player_id,
        author_id=user.id,
        content=body.content,
        author_role=body.author_role,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


@router.get("/players/{player_id}/reviews", response_model=list[ReviewResponse])
async def list_reviews(player_id: str, db: AsyncSession = Depends(get_db)):
    await player_service.get_player_or_404(db, player_id)
    result = await db.execute(
        select(Review)
        .where(Review.player_id == player_id)
        .order_by(Review.created_at.desc())
    )
    return list(result.scalars().all())


@router.post(
    "/data-entries/{entry_id}/verify",
    response_model=DataEntryResponse,
)
async def verify_data_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: DataEntryVerify = Body(default_factory=DataEntryVerify),
):
    result = await db.execute(
        select(DataEntry).where(DataEntry.id == entry_id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Запись не найдена",
        )
    entry.verified_by_id = user.id
    entry.verified_at = _utcnow_naive()
    await db.commit()
    await db.refresh(entry)
    return entry
