"""Seed the database with demo players for presentation purposes.
Run: python -m app.seed
Idempotent: skips if players already exist.
"""
import asyncio
from datetime import date

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
        "region": "Москва", "city": "Москва", "rating": 68.0,
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
        "region": "Красноярский край", "city": "Красноярск", "rating": 85.0,
        "anthro": {"height": 153, "weight": 45, "arm_span": 157, "leg_length": 83,
                   "torso_length": 70, "sitting_height": 78, "shoulder_width": 34, "shoe_size": 37},
    },
]

TEST_SESSIONS_FOR_FIRST_3 = [
    {"sprint_20m_fwd": 3.42, "sprint_20m_bwd": 4.15, "standing_jump": 178.0,
     "agility": 8.2, "flexibility": 12.0, "push_ups": 28, "pull_ups": 8,
     "plank_sec": 95.0},
    {"sprint_20m_fwd": 3.55, "sprint_20m_bwd": 4.37, "standing_jump": 170.0,
     "agility": 8.7, "flexibility": 10.0, "push_ups": 22, "pull_ups": 5,
     "plank_sec": 80.0},
    {"sprint_20m_fwd": 3.38, "sprint_20m_bwd": 4.05, "standing_jump": 165.0,
     "agility": 8.5, "flexibility": 14.0, "push_ups": 25, "pull_ups": 7,
     "plank_sec": 90.0},
]


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

        created_players: list[Player] = []
        for p_data in PLAYERS:
            anthro_data = p_data.pop("anthro")
            player = Player(owner_id=user.id, **p_data)
            db.add(player)
            await db.flush()

            anthro = Anthropometrics(player_id=player.id, **anthro_data)
            db.add(anthro)
            created_players.append(player)

        for i, session_data in enumerate(TEST_SESSIONS_FOR_FIRST_3):
            if i < len(created_players):
                session = PhysicalTestSession(
                    player_id=created_players[i].id, **session_data,
                )
                db.add(session)

        await db.commit()
        print(f"Seeded {len(PLAYERS)} players with demo user: {DEMO_USER['email']}")
        print(f"Demo login: {DEMO_USER['email']} / {DEMO_USER['password']}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
