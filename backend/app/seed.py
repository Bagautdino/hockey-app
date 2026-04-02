"""Seed the database with demo players for presentation purposes.
Run: python -m app.seed
Idempotent: skips if players already exist.
"""
import asyncio
import random
from datetime import date, datetime, timezone

from sqlalchemy import select

from app.database import engine, async_session, Base
from app.models import User, Player, Anthropometrics, PhysicalTestSession  # noqa: F401
from app.services.auth_service import hash_password

DEMO_USER = {
    "email": "demo@hockey.ru",
    "password": "demo1234",
    "full_name": "Демо Родитель",
}

PLAYERS = [
    {
        "first_name": "Алексей", "last_name": "Морозов", "middle_name": "Игоревич",
        "birth_date": date(2012, 3, 15), "position": "forward", "shooting_hand": "left",
        "region": "Москва", "city": "Москва", "team": "ЦСКА Юниоры",
        "jersey_number": 17, "rating": 87.0,
        "anthro": {"height": 152, "weight": 44, "arm_span": 158, "leg_length": 82,
                   "torso_length": 70, "sitting_height": 78, "shoulder_width": 34,
                   "shoe_size": 37, "body_fat_pct": 14.2},
    },
    {
        "first_name": "Дмитрий", "last_name": "Петров",
        "birth_date": date(2011, 7, 22), "position": "defender", "shooting_hand": "right",
        "region": "Санкт-Петербург", "city": "Санкт-Петербург", "team": "СКА Юниоры",
        "jersey_number": 5, "rating": 79.0,
        "anthro": {"height": 160, "weight": 52, "arm_span": 165, "leg_length": 87,
                   "torso_length": 73, "sitting_height": 82, "shoulder_width": 37, "shoe_size": 39},
    },
    {
        "first_name": "Иван", "last_name": "Соколов", "middle_name": "Андреевич",
        "birth_date": date(2013, 1, 10), "position": "goalkeeper", "shooting_hand": "left",
        "region": "Татарстан", "city": "Казань", "team": "Ак Барс Юниоры",
        "jersey_number": 30, "rating": 82.0,
        "anthro": {"height": 148, "weight": 41, "arm_span": 152, "leg_length": 79,
                   "torso_length": 69, "sitting_height": 76, "shoulder_width": 32,
                   "shoe_size": 36, "body_fat_pct": 12.8},
    },
    {
        "first_name": "Сергей", "last_name": "Лебедев",
        "birth_date": date(2012, 9, 5), "position": "forward", "shooting_hand": "right",
        "region": "Свердловская область", "city": "Екатеринбург", "team": "Автомобилист Юниоры",
        "rating": 74.0,
        "anthro": {"height": 155, "weight": 47, "arm_span": 160, "leg_length": 84,
                   "torso_length": 71, "sitting_height": 79, "shoulder_width": 35, "shoe_size": 38},
    },
    {
        "first_name": "Никита", "last_name": "Волков", "middle_name": "Сергеевич",
        "birth_date": date(2011, 12, 18), "position": "defender", "shooting_hand": "left",
        "region": "Новосибирская область", "city": "Новосибирск", "team": "Сибирь Юниоры",
        "jersey_number": 44, "rating": 91.0,
        "anthro": {"height": 163, "weight": 55, "arm_span": 168, "leg_length": 89,
                   "torso_length": 74, "sitting_height": 84, "shoulder_width": 38,
                   "shoe_size": 40, "body_fat_pct": 13.5},
    },
    {
        "first_name": "Андрей", "last_name": "Козлов",
        "birth_date": date(2013, 5, 27), "position": "forward", "shooting_hand": "right",
        "region": "Москва", "city": "Москва",
        "rating": 68.0,
        "anthro": {"height": 145, "weight": 39, "arm_span": 149, "leg_length": 77,
                   "torso_length": 68, "sitting_height": 74, "shoulder_width": 31, "shoe_size": 35},
    },
    {
        "first_name": "Михаил", "last_name": "Попов", "middle_name": "Дмитриевич",
        "birth_date": date(2012, 11, 3), "position": "forward", "shooting_hand": "left",
        "region": "Башкортостан", "city": "Уфа", "team": "Салават Юлаев Юниоры",
        "jersey_number": 91, "rating": 76.0,
        "anthro": {"height": 150, "weight": 43, "arm_span": 155, "leg_length": 81,
                   "torso_length": 69, "sitting_height": 77, "shoulder_width": 33,
                   "shoe_size": 37, "body_fat_pct": 15.1},
    },
    {
        "first_name": "Кирилл", "last_name": "Новиков",
        "birth_date": date(2011, 4, 14), "position": "defender", "shooting_hand": "right",
        "region": "Омская область", "city": "Омск", "team": "Авангард Юниоры",
        "jersey_number": 7, "rating": 83.0,
        "anthro": {"height": 158, "weight": 50, "arm_span": 163, "leg_length": 85,
                   "torso_length": 73, "sitting_height": 81, "shoulder_width": 36, "shoe_size": 39},
    },
    {
        "first_name": "Павел", "last_name": "Зайцев",
        "birth_date": date(2013, 8, 20), "position": "goalkeeper", "shooting_hand": "left",
        "region": "Челябинская область", "city": "Челябинск", "team": "Трактор Юниоры",
        "jersey_number": 1, "rating": 71.0,
        "anthro": {"height": 147, "weight": 40, "arm_span": 151, "leg_length": 78,
                   "torso_length": 69, "sitting_height": 75, "shoulder_width": 31,
                   "shoe_size": 35, "body_fat_pct": 11.9},
    },
    {
        "first_name": "Роман", "last_name": "Сорокин",
        "birth_date": date(2012, 6, 11), "position": "forward", "shooting_hand": "right",
        "region": "Красноярский край", "city": "Красноярск",
        "rating": 85.0,
        "anthro": {"height": 153, "weight": 45, "arm_span": 157, "leg_length": 83,
                   "torso_length": 70, "sitting_height": 78, "shoulder_width": 34, "shoe_size": 37},
    },
    # --- 10 additional players ---
    {
        "first_name": "Артём", "last_name": "Кузнецов", "middle_name": "Владимирович",
        "birth_date": date(2012, 2, 8), "position": "forward", "shooting_hand": "right",
        "region": "Москва", "city": "Москва", "team": "Динамо Юниоры",
        "jersey_number": 10, "rating": 88.0,
        "anthro": {"height": 154, "weight": 46, "arm_span": 160, "leg_length": 83,
                   "torso_length": 71, "sitting_height": 79, "shoulder_width": 35,
                   "shoe_size": 38, "body_fat_pct": 13.0},
    },
    {
        "first_name": "Егор", "last_name": "Смирнов",
        "birth_date": date(2013, 4, 19), "position": "defender", "shooting_hand": "left",
        "region": "Санкт-Петербург", "city": "Санкт-Петербург", "team": "Зенит Хоккей",
        "jersey_number": 22, "rating": 73.0,
        "anthro": {"height": 146, "weight": 40, "arm_span": 150, "leg_length": 78,
                   "torso_length": 68, "sitting_height": 75, "shoulder_width": 31, "shoe_size": 36},
    },
    {
        "first_name": "Максим", "last_name": "Васильев", "middle_name": "Олегович",
        "birth_date": date(2011, 10, 2), "position": "forward", "shooting_hand": "right",
        "region": "Татарстан", "city": "Казань", "team": "Ак Барс Юниоры",
        "jersey_number": 71, "rating": 90.0,
        "anthro": {"height": 162, "weight": 54, "arm_span": 167, "leg_length": 88,
                   "torso_length": 74, "sitting_height": 83, "shoulder_width": 37,
                   "shoe_size": 40, "body_fat_pct": 12.5},
    },
    {
        "first_name": "Даниил", "last_name": "Федоров",
        "birth_date": date(2012, 7, 30), "position": "goalkeeper", "shooting_hand": "left",
        "region": "Свердловская область", "city": "Екатеринбург", "team": "Автомобилист Юниоры",
        "jersey_number": 35, "rating": 77.0,
        "anthro": {"height": 156, "weight": 48, "arm_span": 162, "leg_length": 84,
                   "torso_length": 72, "sitting_height": 80, "shoulder_width": 35, "shoe_size": 38},
    },
    {
        "first_name": "Илья", "last_name": "Орлов", "middle_name": "Павлович",
        "birth_date": date(2013, 9, 12), "position": "forward", "shooting_hand": "left",
        "region": "Новосибирская область", "city": "Новосибирск",
        "rating": 65.0,
        "anthro": {"height": 143, "weight": 37, "arm_span": 147, "leg_length": 76,
                   "torso_length": 67, "sitting_height": 73, "shoulder_width": 30, "shoe_size": 34},
    },
    {
        "first_name": "Тимур", "last_name": "Хасанов",
        "birth_date": date(2012, 1, 25), "position": "defender", "shooting_hand": "right",
        "region": "Башкортостан", "city": "Уфа", "team": "Салават Юлаев Юниоры",
        "jersey_number": 4, "rating": 80.0,
        "anthro": {"height": 157, "weight": 49, "arm_span": 162, "leg_length": 85,
                   "torso_length": 72, "sitting_height": 80, "shoulder_width": 36,
                   "shoe_size": 39, "body_fat_pct": 14.0},
    },
    {
        "first_name": "Владислав", "last_name": "Михайлов", "middle_name": "Артёмович",
        "birth_date": date(2011, 8, 7), "position": "forward", "shooting_hand": "right",
        "region": "Омская область", "city": "Омск", "team": "Авангард Юниоры",
        "jersey_number": 19, "rating": 86.0,
        "anthro": {"height": 161, "weight": 53, "arm_span": 166, "leg_length": 87,
                   "torso_length": 74, "sitting_height": 83, "shoulder_width": 37, "shoe_size": 40},
    },
    {
        "first_name": "Глеб", "last_name": "Семёнов",
        "birth_date": date(2013, 3, 14), "position": "defender", "shooting_hand": "left",
        "region": "Челябинская область", "city": "Челябинск", "team": "Трактор Юниоры",
        "jersey_number": 3, "rating": 72.0,
        "anthro": {"height": 144, "weight": 38, "arm_span": 148, "leg_length": 77,
                   "torso_length": 67, "sitting_height": 74, "shoulder_width": 30,
                   "shoe_size": 35, "body_fat_pct": 13.2},
    },
    {
        "first_name": "Александр", "last_name": "Беляев", "middle_name": "Николаевич",
        "birth_date": date(2012, 5, 21), "position": "forward", "shooting_hand": "left",
        "region": "Красноярский край", "city": "Красноярск",
        "rating": 81.0,
        "anthro": {"height": 151, "weight": 44, "arm_span": 156, "leg_length": 82,
                   "torso_length": 69, "sitting_height": 77, "shoulder_width": 33, "shoe_size": 37},
    },
    {
        "first_name": "Матвей", "last_name": "Григорьев",
        "birth_date": date(2011, 11, 28), "position": "goalkeeper", "shooting_hand": "right",
        "region": "Москва", "city": "Москва", "team": "Спартак Юниоры",
        "jersey_number": 31, "rating": 84.0,
        "anthro": {"height": 164, "weight": 56, "arm_span": 170, "leg_length": 89,
                   "torso_length": 75, "sitting_height": 84, "shoulder_width": 38,
                   "shoe_size": 41, "body_fat_pct": 12.0},
    },
]

random.seed(42)


def _rand_test_session(rating: float) -> dict:
    """Generate realistic test session data scaled by player rating."""
    base = rating / 100.0
    return {
        "sprint_20m_fwd": round(4.0 - base * 0.7 + random.uniform(-0.1, 0.1), 2),
        "sprint_20m_bwd": round(4.8 - base * 0.7 + random.uniform(-0.1, 0.1), 2),
        "sprint_60m": round(9.5 - base * 1.2 + random.uniform(-0.2, 0.2), 2),
        "standing_jump": round(140 + base * 50 + random.uniform(-5, 5)),
        "long_jump": round(160 + base * 40 + random.uniform(-5, 5)),
        "agility": round(9.5 - base * 1.5 + random.uniform(-0.2, 0.2), 2),
        "flexibility": round(5 + base * 12 + random.uniform(-1, 1)),
        "push_ups": round(15 + base * 20 + random.uniform(-3, 3)),
        "pull_ups": round(2 + base * 10 + random.uniform(-1, 1)),
        "plank_sec": round(50 + base * 60 + random.uniform(-5, 5)),
        "balance_test_sec": round(15 + base * 20 + random.uniform(-2, 2)),
    }


def _test_date(months_ago: int) -> datetime:
    """Return a naive UTC datetime for `months_ago` months before now."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    m = now.month - months_ago
    y = now.year
    while m < 1:
        m += 12
        y -= 1
    day = min(now.day, 28)
    return now.replace(year=y, month=m, day=day)


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        existing = (await db.execute(select(Player).limit(1))).scalar_one_or_none()
        if existing:
            print("Database already has players. Skipping seed.")
            return

        user = User(
            email=DEMO_USER["email"],
            hashed_password=hash_password(DEMO_USER["password"]),
            full_name=DEMO_USER["full_name"],
            role="parent",
        )
        db.add(user)
        await db.flush()

        for p_data in PLAYERS:
            anthro_data = p_data.pop("anthro")
            player_rating = p_data["rating"]
            player = Player(owner_id=user.id, **p_data)
            db.add(player)
            await db.flush()

            anthro = Anthropometrics(player_id=player.id, **anthro_data)
            db.add(anthro)

            for months_ago in [6, 4, 2, 0]:
                session = PhysicalTestSession(
                    player_id=player.id,
                    recorded_at=_test_date(months_ago),
                    **_rand_test_session(player_rating),
                )
                db.add(session)

        await db.commit()
        print(f"Seeded {len(PLAYERS)} players, each with 4 test sessions.")
        print(f"Demo login: {DEMO_USER['email']} / {DEMO_USER['password']}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
