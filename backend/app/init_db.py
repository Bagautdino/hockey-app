"""Create all database tables. Used for initial deployment when no Alembic migrations exist yet."""
import asyncio

from app.database import engine, Base
from app.models import *  # noqa: F401,F403


async def init() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("Database tables created successfully.")


if __name__ == "__main__":
    asyncio.run(init())
