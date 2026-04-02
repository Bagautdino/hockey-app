import asyncio
from collections.abc import AsyncGenerator
from datetime import date

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.database import Base, get_db
from app.main import app
from app.services.auth_service import hash_password, create_token
from app.models.user import User
from app.models.player import Player, Anthropometrics

TEST_DB_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(TEST_DB_URL, echo=False)
test_session = async_sessionmaker(engine, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    """Share a single event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    """Create and drop all tables for each test."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    """Override DB dependency for tests."""
    async with test_session() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    """Direct DB session for fixtures."""
    async with test_session() as session:
        yield session


async def make_user(
    db: AsyncSession,
    email: str = "test@example.com",
    password: str = "password123",
    role: str = "parent",
    full_name: str = "Test User",
) -> User:
    """Factory: create a user in the test DB."""
    user = User(
        email=email,
        hashed_password=hash_password(password),
        role=role,
        full_name=full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def make_player(
    db: AsyncSession, owner_id: str, region: str = "Москва"
) -> Player:
    """Factory: create a player with anthropometrics."""
    player = Player(
        owner_id=owner_id,
        first_name="Алексей",
        last_name="Тестов",
        birth_date=date(2012, 3, 15),
        position="forward",
        shooting_hand="left",
        city="Москва",
        region=region,
        rating=80.0,
    )
    player.anthropometrics = Anthropometrics(
        height=152, weight=44, arm_span=158, leg_length=82,
        torso_length=70, sitting_height=78, shoulder_width=34, shoe_size=37,
    )
    db.add(player)
    await db.commit()
    await db.refresh(player)
    return player


def auth_header(user_id: str) -> dict[str, str]:
    """Generate an Authorization header for a user."""
    token = create_token(user_id, "access")
    return {"Authorization": f"Bearer {token}"}
