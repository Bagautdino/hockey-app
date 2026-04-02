from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, players, videos

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


@app.get("/api/v1/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}
