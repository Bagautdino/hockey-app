from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    anthro_snapshots,
    auth,
    game_stats,
    injuries,
    players,
    reviews,
    video_clips,
    videos,
)

app = FastAPI(title="Хоккейный Родитель API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(players.router)
app.include_router(videos.router)
app.include_router(injuries.router, prefix="/api/v1", tags=["injuries"])
app.include_router(game_stats.router, prefix="/api/v1", tags=["game-stats"])
app.include_router(video_clips.router, prefix="/api/v1", tags=["video-clips"])
app.include_router(reviews.router, prefix="/api/v1", tags=["reviews"])
app.include_router(anthro_snapshots.router, prefix="/api/v1", tags=["anthro-snapshots"])


@app.get("/api/v1/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}
