import pytest
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, Player, Anthropometrics, PhysicalTestSession
from app.seed import PLAYERS, DEMO_USER, _rand_test_session
from app.services.auth_service import hash_password


async def _run_seed_in_test_db(db: AsyncSession) -> None:
    """Re-implementation of seed logic using the test DB session."""
    user = User(
        email=DEMO_USER["email"],
        hashed_password=hash_password(DEMO_USER["password"]),
        full_name=DEMO_USER["full_name"],
        role="parent",
    )
    db.add(user)
    await db.flush()

    import random
    from datetime import datetime, timezone
    random.seed(42)

    for p_data in [dict(p) for p in PLAYERS]:
        anthro_data = p_data.pop("anthro")
        player_rating = p_data["rating"]
        player = Player(owner_id=user.id, **p_data)
        db.add(player)
        await db.flush()

        anthro = Anthropometrics(player_id=player.id, **anthro_data)
        db.add(anthro)

        for months_ago in [6, 4, 2, 0]:
            now = datetime.now(timezone.utc).replace(tzinfo=None)
            m = now.month - months_ago
            y = now.year
            while m < 1:
                m += 12
                y -= 1
            day = min(now.day, 28)
            rec_at = now.replace(year=y, month=m, day=day)
            session = PhysicalTestSession(
                player_id=player.id,
                recorded_at=rec_at,
                **_rand_test_session(player_rating),
            )
            db.add(session)

    await db.commit()


@pytest.mark.asyncio
async def test_seed_creates_demo_user(db: AsyncSession):
    """Seed создает демо-пользователя."""
    await _run_seed_in_test_db(db)

    result = await db.execute(select(User).where(User.email == DEMO_USER["email"]))
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.full_name == DEMO_USER["full_name"]
    assert user.role == "parent"


@pytest.mark.asyncio
async def test_seed_creates_all_players(db: AsyncSession):
    """Seed создает все 20 игроков."""
    await _run_seed_in_test_db(db)

    result = await db.execute(select(func.count(Player.id)))
    count = result.scalar()
    assert count == len(PLAYERS)


@pytest.mark.asyncio
async def test_seed_creates_anthropometrics_for_all(db: AsyncSession):
    """Каждый игрок имеет антропометрию."""
    await _run_seed_in_test_db(db)

    result = await db.execute(select(func.count(Anthropometrics.id)))
    count = result.scalar()
    assert count == len(PLAYERS)


@pytest.mark.asyncio
async def test_seed_creates_test_sessions_for_all(db: AsyncSession):
    """Каждый игрок имеет 4 тестовых сессии."""
    await _run_seed_in_test_db(db)

    result = await db.execute(select(func.count(PhysicalTestSession.id)))
    count = result.scalar()
    assert count == len(PLAYERS) * 4


@pytest.mark.asyncio
async def test_seed_players_have_correct_regions(db: AsyncSession):
    """Игроки из разных регионов представлены."""
    await _run_seed_in_test_db(db)

    result = await db.execute(select(Player.region).distinct())
    regions = {row[0] for row in result.all()}
    assert "Москва" in regions
    assert "Санкт-Петербург" in regions
    assert "Татарстан" in regions
    assert len(regions) >= 9


@pytest.mark.asyncio
async def test_seed_players_have_varied_positions(db: AsyncSession):
    """В данных есть нападающие, защитники и вратари."""
    await _run_seed_in_test_db(db)

    result = await db.execute(select(Player.position).distinct())
    positions = {row[0] for row in result.all()}
    assert "forward" in positions
    assert "defender" in positions
    assert "goalkeeper" in positions


def test_rand_test_session_varies_by_rating():
    """Генератор тестовых данных масштабируется от рейтинга."""
    import random
    random.seed(42)
    low = _rand_test_session(60.0)
    random.seed(42)
    high = _rand_test_session(95.0)
    assert high["standing_jump"] > low["standing_jump"]
    assert high["push_ups"] > low["push_ups"]


def test_rand_test_session_has_all_fields():
    """Генератор возвращает все 11 метрик."""
    data = _rand_test_session(80.0)
    expected = {
        "sprint_20m_fwd", "sprint_20m_bwd", "sprint_60m",
        "standing_jump", "long_jump", "agility", "flexibility",
        "push_ups", "pull_ups", "plank_sec", "balance_test_sec",
    }
    assert set(data.keys()) == expected


def test_player_count_is_twenty():
    """Seed данные содержат 20 игроков."""
    assert len(PLAYERS) == 20
