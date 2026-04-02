import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import make_user, make_player, auth_header

PLAYER_DATA = {
    "first_name": "Дмитрий",
    "last_name": "Новиков",
    "birth_date": "2012-06-15",
    "position": "forward",
    "shooting_hand": "left",
    "city": "Москва",
    "region": "Москва",
    "anthropometrics": {
        "height": 152, "weight": 44, "arm_span": 158, "leg_length": 82,
        "torso_length": 70, "sitting_height": 78, "shoulder_width": 34,
        "shoe_size": 37,
    },
}

TEST_SESSION_DATA = {
    "sprint_20m_fwd": 3.42,
    "sprint_20m_bwd": 4.15,
    "standing_jump": 178.0,
    "agility": 8.2,
    "flexibility": 12.0,
    "push_ups": 28,
    "pull_ups": 8,
    "plank_sec": 95.0,
    "balance_test_sec": 25.0,
}


@pytest.mark.asyncio
async def test_create_player_saves_all_fields(client: AsyncClient, db: AsyncSession):
    """Создание игрока сохраняет все поля включая антропометрию."""
    user = await make_user(db)
    resp = await client.post(
        "/api/v1/players",
        json=PLAYER_DATA,
        headers=auth_header(user.id),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["first_name"] == "Дмитрий"
    assert data["position"] == "forward"
    assert data["anthropometrics"]["height"] == 152
    assert data["anthropometrics"]["shoe_size"] == 37


@pytest.mark.asyncio
async def test_create_player_requires_auth(client: AsyncClient):
    """Создание игрока без токена возвращает 401/403."""
    resp = await client.post("/api/v1/players", json=PLAYER_DATA)
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_list_players_returns_all(client: AsyncClient, db: AsyncSession):
    """Список игроков возвращает всех созданных."""
    user = await make_user(db)
    await make_player(db, user.id, region="Москва")
    await make_player(db, user.id, region="СПб")
    await make_player(db, user.id, region="Казань")

    resp = await client.get("/api/v1/players")
    assert resp.status_code == 200
    assert len(resp.json()) == 3


@pytest.mark.asyncio
async def test_list_players_filter_by_region(client: AsyncClient, db: AsyncSession):
    """Список игроков фильтруется по региону."""
    user = await make_user(db)
    await make_player(db, user.id, region="Москва")
    await make_player(db, user.id, region="СПб")

    resp = await client.get("/api/v1/players?region=Москва")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["region"] == "Москва"


@pytest.mark.asyncio
async def test_list_players_filter_by_position(client: AsyncClient, db: AsyncSession):
    """Список игроков фильтруется по позиции."""
    user = await make_user(db)
    await make_player(db, user.id, region="Москва")

    resp = await client.get("/api/v1/players?position=forward")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert all(p["position"] == "forward" for p in data)


@pytest.mark.asyncio
async def test_list_players_filter_by_age(client: AsyncClient, db: AsyncSession):
    """Список игроков фильтруется по возрасту."""
    user = await make_user(db)
    await make_player(db, user.id)

    resp = await client.get("/api/v1/players?age_min=10&age_max=15")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_list_players_no_auth_required(client: AsyncClient, db: AsyncSession):
    """Список игроков доступен без авторизации."""
    user = await make_user(db)
    await make_player(db, user.id)

    resp = await client.get("/api/v1/players")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_get_player_detail(client: AsyncClient, db: AsyncSession):
    """Детальная информация об игроке включает антропометрию."""
    user = await make_user(db)
    player = await make_player(db, user.id)

    resp = await client.get(f"/api/v1/players/{player.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == player.id
    assert data["first_name"] == "Алексей"
    assert data["anthropometrics"]["height"] == 152


@pytest.mark.asyncio
async def test_get_player_not_found(client: AsyncClient):
    """Несуществующий игрок возвращает 404."""
    resp = await client.get("/api/v1/players/nonexistent-uuid")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_player_by_owner(client: AsyncClient, db: AsyncSession):
    """Владелец может обновить данные игрока."""
    owner = await make_user(db)
    player = await make_player(db, owner.id)

    resp = await client.put(
        f"/api/v1/players/{player.id}",
        json={"first_name": "Обновлённый"},
        headers=auth_header(owner.id),
    )
    assert resp.status_code == 200
    assert resp.json()["first_name"] == "Обновлённый"


@pytest.mark.asyncio
async def test_update_player_forbidden_for_non_owner(client: AsyncClient, db: AsyncSession):
    """Чужой игрок недоступен для редактирования."""
    owner = await make_user(db, email="owner@example.com")
    stranger = await make_user(db, email="stranger@example.com")
    player = await make_player(db, owner.id)

    resp = await client.put(
        f"/api/v1/players/{player.id}",
        json={"first_name": "Хакер"},
        headers=auth_header(stranger.id),
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_delete_player(client: AsyncClient, db: AsyncSession):
    """Владелец может удалить игрока."""
    owner = await make_user(db)
    player = await make_player(db, owner.id)

    resp = await client.delete(
        f"/api/v1/players/{player.id}",
        headers=auth_header(owner.id),
    )
    assert resp.status_code == 204

    resp2 = await client.get(f"/api/v1/players/{player.id}")
    assert resp2.status_code == 404


@pytest.mark.asyncio
async def test_get_player_rating(client: AsyncClient, db: AsyncSession):
    """Рейтинг возвращает regional rank."""
    user = await make_user(db)
    player = await make_player(db, user.id)

    resp = await client.get(f"/api/v1/players/{player.id}/rating")
    assert resp.status_code == 200
    data = resp.json()
    assert "rating" in data
    assert "regional_rank" in data
    assert "regional_total" in data
    assert data["rating"] == 80.0


@pytest.mark.asyncio
async def test_get_rating_not_found(client: AsyncClient):
    """Рейтинг несуществующего игрока — 404."""
    resp = await client.get("/api/v1/players/nonexistent-id/rating")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_add_test_session(client: AsyncClient, db: AsyncSession):
    """Создание тестовой сессии сохраняет все физические показатели."""
    user = await make_user(db)
    player = await make_player(db, user.id)

    resp = await client.post(
        f"/api/v1/players/{player.id}/tests",
        json=TEST_SESSION_DATA,
        headers=auth_header(user.id),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["sprint_20m_fwd"] == 3.42
    assert data["standing_jump"] == 178.0
    assert data["push_ups"] == 28
    assert data["plank_sec"] == 95.0


@pytest.mark.asyncio
async def test_add_test_session_requires_auth(client: AsyncClient, db: AsyncSession):
    """Добавление тестовой сессии требует авторизации."""
    user = await make_user(db)
    player = await make_player(db, user.id)

    resp = await client.post(
        f"/api/v1/players/{player.id}/tests",
        json=TEST_SESSION_DATA,
    )
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_list_test_sessions(client: AsyncClient, db: AsyncSession):
    """Список тестовых сессий возвращает все добавленные."""
    user = await make_user(db)
    player = await make_player(db, user.id)

    await client.post(
        f"/api/v1/players/{player.id}/tests",
        json=TEST_SESSION_DATA,
        headers=auth_header(user.id),
    )
    await client.post(
        f"/api/v1/players/{player.id}/tests",
        json={**TEST_SESSION_DATA, "sprint_20m_fwd": 3.50},
        headers=auth_header(user.id),
    )

    resp = await client.get(f"/api/v1/players/{player.id}/tests")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_list_test_sessions_empty(client: AsyncClient, db: AsyncSession):
    """Пустой список тестовых сессий — пустой массив, не ошибка."""
    user = await make_user(db)
    player = await make_player(db, user.id)

    resp = await client.get(f"/api/v1/players/{player.id}/tests")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_regional_rank_multiple_players(client: AsyncClient, db: AsyncSession):
    """Regional rank корректно считает позицию среди нескольких игроков."""
    user = await make_user(db)
    from app.models.player import Player, Anthropometrics
    from datetime import date

    for i, rating in enumerate([60, 80, 90]):
        p = Player(
            owner_id=user.id,
            first_name=f"Player{i}",
            last_name="Test",
            birth_date=date(2012, 1, 1),
            position="forward",
            shooting_hand="left",
            city="Москва",
            region="Москва",
            rating=float(rating),
        )
        p.anthropometrics = Anthropometrics(
            height=150, weight=45, arm_span=155, leg_length=80,
            torso_length=70, sitting_height=77, shoulder_width=33, shoe_size=37,
        )
        db.add(p)
    await db.commit()

    resp = await client.get("/api/v1/players")
    players = resp.json()
    top_player = [p for p in players if p["rating"] == 90.0][0]

    resp = await client.get(f"/api/v1/players/{top_player['id']}/rating")
    data = resp.json()
    assert data["regional_rank"] == 1
    assert data["regional_total"] == 3


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    """Health-check эндпоинт доступен."""
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
