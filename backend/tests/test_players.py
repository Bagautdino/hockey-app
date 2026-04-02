import pytest
from httpx import AsyncClient

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


@pytest.mark.asyncio
async def test_create_player_saves_all_fields(client: AsyncClient, db):
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
async def test_list_players_filter_by_region(client: AsyncClient, db):
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
async def test_list_players_filter_by_age(client: AsyncClient, db):
    """Список игроков фильтруется по возрасту."""
    user = await make_user(db)
    await make_player(db, user.id)

    resp = await client.get("/api/v1/players?age_min=10&age_max=15")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_update_player_forbidden_for_non_owner(client: AsyncClient, db):
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
async def test_get_player_rating(client: AsyncClient, db):
    """Рейтинг возвращает regional rank."""
    user = await make_user(db)
    player = await make_player(db, user.id)

    resp = await client.get(f"/api/v1/players/{player.id}/rating")
    assert resp.status_code == 200
    data = resp.json()
    assert "rating" in data
    assert "regional_rank" in data
    assert "regional_total" in data
