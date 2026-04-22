from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.video_clip import VideoClip
from app.schemas.video_clip import VideoClipCreate, VideoClipResponse
from app.services.auth_service import get_current_user
from app.services import player_service

router = APIRouter(prefix="")


@router.post(
    "/players/{player_id}/video-clips",
    response_model=VideoClipResponse,
    status_code=201,
)
async def create_video_clip(
    player_id: str,
    body: VideoClipCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await player_service.get_player_or_404(db, player_id)
    clip = VideoClip(
        player_id=player_id,
        uploader_id=user.id,
        title=body.title,
        video_url=body.video_url,
        category=body.category,
        position_type=body.position_type,
        notes=body.notes,
    )
    db.add(clip)
    await db.commit()
    await db.refresh(clip)
    return clip


@router.get("/players/{player_id}/video-clips", response_model=list[VideoClipResponse])
async def list_video_clips(
    player_id: str,
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    await player_service.get_player_or_404(db, player_id)
    q = select(VideoClip).where(VideoClip.player_id == player_id)
    if category is not None:
        q = q.where(VideoClip.category == category)
    q = q.order_by(VideoClip.uploaded_at.desc())
    result = await db.execute(q)
    return list(result.scalars().all())


@router.delete("/video-clips/{clip_id}", status_code=204)
async def delete_video_clip(
    clip_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(VideoClip).where(VideoClip.id == clip_id))
    clip = result.scalar_one_or_none()
    if not clip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Клип не найден",
        )
    player = await player_service.get_player_or_404(db, clip.player_id)
    if clip.uploader_id != user.id and player.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этому клипу",
        )
    await db.delete(clip)
    await db.commit()
