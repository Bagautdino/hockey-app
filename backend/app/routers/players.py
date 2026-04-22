from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.repositories import player_repo
from app.schemas.player import (
    PlayerCreate,
    PlayerPartialUpdate,
    PlayerUpdate,
    PlayerResponse,
    TestSessionCreate,
    TestSessionResponse,
)
from app.services.auth_service import get_current_user
from app.services import player_service, video_service

MAX_PHOTO_SIZE = 10 * 1024 * 1024
ALLOWED_PHOTO_TYPES = frozenset(
    {"image/jpeg", "image/png", "image/webp"}
)

router = APIRouter(prefix="/api/v1/players", tags=["players"])


@router.post("", response_model=PlayerResponse, status_code=201)
async def create_player(
    body: PlayerCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new player profile (parent only)."""
    player = await player_service.create_player(db, body, user)
    return player


@router.get("", response_model=list[PlayerResponse])
async def list_players(
    region: str | None = Query(None),
    position: str | None = Query(None),
    age_min: int | None = Query(None),
    age_max: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List players with optional filters."""
    return await player_repo.list_players(
        db, region=region, position=position, age_min=age_min, age_max=age_max
    )


@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(player_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single player with anthropometrics."""
    return await player_service.get_player_or_404(db, player_id)


@router.put("/{player_id}", response_model=PlayerResponse)
async def update_player(
    player_id: str,
    body: PlayerUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update a player (owner only)."""
    player = await player_service.get_player_or_404(db, player_id)
    player_service.assert_owner(player, user)
    return await player_service.update_player(db, player, body)


@router.patch("/{player_id}", response_model=PlayerResponse)
async def patch_player(
    player_id: str,
    body: PlayerPartialUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    player = await player_service.get_player_or_404(db, player_id)
    player_service.assert_owner(player, user)
    return await player_service.patch_player_partial(db, player, body)


@router.post("/{player_id}/photo", status_code=201)
async def upload_player_photo(
    player_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    player = await player_service.get_player_or_404(db, player_id)
    player_service.assert_owner(player, user)
    if file.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Допустимые форматы: jpeg, png, webp",
        )
    content = await file.read()
    if len(content) > MAX_PHOTO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл превышает 10MB",
        )
    key = video_service.upload_photo_to_s3(content, file.filename or "photo.jpg")
    player.photo_key = key
    await player_repo.update_player(db, player)
    return {"photo_key": key}


@router.get("/{player_id}/photo")
async def get_player_photo_url(
    player_id: str, db: AsyncSession = Depends(get_db)
):
    player = await player_service.get_player_or_404(db, player_id)
    if not player.photo_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Фото не загружено",
        )
    url = video_service.get_presigned_url(player.photo_key)
    return {"url": url, "expires_in": 3600}


@router.delete("/{player_id}", status_code=204)
async def delete_player(
    player_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete a player (owner only)."""
    player = await player_service.get_player_or_404(db, player_id)
    player_service.assert_owner(player, user)
    await player_repo.delete_player(db, player)


@router.get("/{player_id}/rating")
async def get_rating(player_id: str, db: AsyncSession = Depends(get_db)):
    """Get player rating with regional rank."""
    player = await player_service.get_player_or_404(db, player_id)
    rank, total = await player_repo.get_regional_rank(db, player)
    return {
        "player_id": player.id,
        "rating": player.rating,
        "regional_rank": rank,
        "regional_total": total,
    }


@router.post(
    "/{player_id}/tests", response_model=TestSessionResponse, status_code=201
)
async def add_test_session(
    player_id: str,
    body: TestSessionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Add a physical test session (owner only)."""
    player = await player_service.get_player_or_404(db, player_id)
    player_service.assert_owner(player, user)
    session = await player_service.add_test_session(db, player_id, body)
    return TestSessionResponse(
        id=session.id,
        player_id=session.player_id,
        recorded_at=session.recorded_at.isoformat(),
        category=session.category,
        test_name=session.test_name,
        sprint_20m_fwd=session.sprint_20m_fwd,
        sprint_20m_bwd=session.sprint_20m_bwd,
        sprint_60m=session.sprint_60m,
        standing_jump=session.standing_jump,
        long_jump=session.long_jump,
        agility=session.agility,
        flexibility=session.flexibility,
        push_ups=session.push_ups,
        pull_ups=session.pull_ups,
        plank_sec=session.plank_sec,
        balance_test_sec=session.balance_test_sec,
    )


@router.get("/{player_id}/tests", response_model=list[TestSessionResponse])
async def list_test_sessions(
    player_id: str, db: AsyncSession = Depends(get_db)
):
    """List all physical test sessions for a player."""
    sessions = await player_repo.list_test_sessions(db, player_id)
    return [
        TestSessionResponse(
            id=s.id,
            player_id=s.player_id,
            recorded_at=s.recorded_at.isoformat(),
            category=s.category,
            test_name=s.test_name,
            sprint_20m_fwd=s.sprint_20m_fwd,
            sprint_20m_bwd=s.sprint_20m_bwd,
            sprint_60m=s.sprint_60m,
            standing_jump=s.standing_jump,
            long_jump=s.long_jump,
            agility=s.agility,
            flexibility=s.flexibility,
            push_ups=s.push_ups,
            pull_ups=s.pull_ups,
            plank_sec=s.plank_sec,
            balance_test_sec=s.balance_test_sec,
        )
        for s in sessions
    ]
