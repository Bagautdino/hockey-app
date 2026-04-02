from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.video import Video
from app.schemas.video import VideoResponse, VideoUploadResponse
from app.services.auth_service import get_current_user
from app.services import player_service, video_service

router = APIRouter(prefix="/api/v1", tags=["videos"])

MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500MB


@router.post(
    "/players/{player_id}/videos",
    response_model=VideoUploadResponse,
    status_code=201,
)
async def upload_video(
    player_id: str,
    file: UploadFile = File(...),
    title: str = Form(...),
    skill_tag: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Upload a video for a player."""
    player = await player_service.get_player_or_404(db, player_id)
    player_service.assert_owner(player, user)

    if file.content_type not in ("video/mp4", "video/quicktime"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Допустимые форматы: mp4, mov",
        )

    content = await file.read()
    if len(content) > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл превышает 500MB",
        )

    s3_key = video_service.upload_to_s3(content, file.filename or "video.mp4")

    video = Video(
        player_id=player_id,
        title=title,
        s3_key=s3_key,
        skill_tag=skill_tag,
        status="ready",
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)

    return VideoUploadResponse(
        id=video.id, status=video.status, message="Видео загружено"
    )


@router.get("/players/{player_id}/videos", response_model=list[VideoResponse])
async def list_videos(player_id: str, db: AsyncSession = Depends(get_db)):
    """List all videos for a player."""
    result = await db.execute(
        select(Video)
        .where(Video.player_id == player_id)
        .order_by(Video.uploaded_at.desc())
    )
    videos = result.scalars().all()
    return [
        VideoResponse(
            id=v.id,
            player_id=v.player_id,
            title=v.title,
            thumbnail_url=None,
            duration_sec=v.duration_sec,
            skill_tag=v.skill_tag,
            status=v.status,
            uploaded_at=v.uploaded_at.isoformat(),
        )
        for v in videos
    ]


@router.get("/videos/{video_id}/url")
async def get_video_url(video_id: str, db: AsyncSession = Depends(get_db)):
    """Get a presigned URL for video playback (1h expiry)."""
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Видео не найдено",
        )
    url = video_service.get_presigned_url(video.s3_key)
    return {"url": url, "expires_in": 3600}
