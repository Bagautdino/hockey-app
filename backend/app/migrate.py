"""Database migration: create tables + add missing columns.
Run: python -m app.migrate
"""
import asyncio

from sqlalchemy import text

from app.database import engine, Base
from app.models import *  # noqa: F401,F403

ALTER_STATEMENTS = [
    "ALTER TABLE players ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
    "ALTER TABLE players ADD COLUMN IF NOT EXISTS hockey_start_date DATE",
    "ALTER TABLE players ADD COLUMN IF NOT EXISTS photo_key VARCHAR(500)",
    "ALTER TABLE physical_test_sessions ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'off_ice'",
    "ALTER TABLE physical_test_sessions ADD COLUMN IF NOT EXISTS test_name VARCHAR(200)",
    "ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000)",
    "ALTER TABLE videos ADD COLUMN IF NOT EXISTS rating INTEGER",
    "ALTER TABLE videos ADD COLUMN IF NOT EXISTS assessment_date DATE",
    "ALTER TABLE videos ADD COLUMN IF NOT EXISTS comment TEXT",
    "ALTER TABLE videos ADD COLUMN IF NOT EXISTS training_plan TEXT",
    "ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_assessment BOOLEAN DEFAULT false",
]


async def migrate() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with engine.begin() as conn:
        for stmt in ALTER_STATEMENTS:
            try:
                await conn.execute(text(stmt))
            except Exception:
                pass

    await engine.dispose()
    print("Migration complete: tables created, columns added.")


if __name__ == "__main__":
    asyncio.run(migrate())
