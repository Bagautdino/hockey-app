import pytest
from httpx import AsyncClient

from tests.conftest import make_user, auth_header


@pytest.mark.asyncio
async def test_register_creates_user(client: AsyncClient):
    """Регистрация создает пользователя в БД."""
    resp = await client.post("/api/v1/auth/register", json={
        "email": "new@example.com",
        "password": "secret123",
        "full_name": "Иван Петров",
        "role": "parent",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "new@example.com"
    assert data["role"] == "parent"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, db):
    """Дублирующий email возвращает 409."""
    await make_user(db, email="dup@example.com")
    resp = await client.post("/api/v1/auth/register", json={
        "email": "dup@example.com",
        "password": "secret123",
        "full_name": "Dup User",
    })
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_returns_token(client: AsyncClient, db):
    """Логин возвращает JWT токен."""
    await make_user(db, email="login@example.com", password="mypass")
    resp = await client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "mypass",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, db):
    """Неверный пароль возвращает 401."""
    await make_user(db, email="wrong@example.com", password="correct")
    resp = await client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com",
        "password": "incorrect",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_without_token(client: AsyncClient):
    """Защищенный эндпоинт отклоняет запрос без токена."""
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_me_with_token(client: AsyncClient, db):
    """Аутентифицированный запрос возвращает данные пользователя."""
    user = await make_user(db, email="me@example.com")
    resp = await client.get("/api/v1/auth/me", headers=auth_header(user.id))
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, db):
    """Рефреш токен обновляет access token."""
    await make_user(db, email="refresh@example.com", password="pass123")
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "refresh@example.com",
        "password": "pass123",
    })
    refresh_token = login_resp.json()["refresh_token"]

    resp = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh_token,
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()
