## Current Task
Bootstrap FastAPI backend and connect it to the existing React frontend.
Replace all mock JSON data with real API calls.

## Backend Setup (do this first)
Project structure:
backend/
├── app/
│   ├── main.py
│   ├── config.py              # Settings via pydantic-settings
│   ├── database.py            # Async SQLAlchemy engine + session
│   ├── models/                # SQLAlchemy ORM models
│   │   ├── player.py
│   │   ├── user.py
│   │   └── video.py
│   ├── schemas/               # Pydantic v2 schemas
│   │   ├── player.py
│   │   ├── user.py
│   │   └── video.py
│   ├── routers/               # FastAPI routers
│   │   ├── auth.py
│   │   ├── players.py
│   │   └── videos.py
│   ├── services/              # Business logic
│   │   ├── auth_service.py
│   │   ├── player_service.py
│   │   └── video_service.py
│   └── repositories/          # DB queries only
│       ├── player_repo.py
│       └── user_repo.py
├── alembic/                   # Migrations
├── tests/
│   ├── conftest.py            # pytest fixtures, test DB
│   ├── test_auth.py
│   └── test_players.py
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── requirements.txt

## Tech Stack
- Python 3.12, FastAPI, uvicorn
- SQLAlchemy 2.0 (async) + asyncpg
- PostgreSQL 16 (via Docker)
- Alembic (migrations)
- Pydantic v2
- python-jose (JWT)
- passlib + bcrypt (password hashing)
- boto3 (MinIO/S3 for videos)
- pytest + httpx (async test client)

## Database Models

### User
- id (UUID), email, hashed_password, role (parent/scout/admin)
- full_name, created_at, updated_at

### Player
- id (UUID), owner_id (FK → User)
- first_name, last_name, middle_name (nullable)
- birth_date, position, shooting_hand
- city, region, team, jersey_number (nullable)
- Anthropometrics as separate table (1-to-1):
  height, weight, arm_span, leg_length, torso_length,
  sitting_height, shoulder_width, shoe_size, body_fat_pct
- created_at, updated_at

### PhysicalTestSession
- id (UUID), player_id (FK), recorded_at
- sprint_20m_fwd, sprint_20m_bwd, sprint_60m (nullable)
- standing_jump, long_jump (nullable)
- push_ups, pull_ups, plank_sec, balance_test_sec (nullable)

### Video
- id (UUID), player_id (FK)
- s3_key, thumbnail_key, duration_sec
- skill_tag, status (pending/processing/ready)
- uploaded_at

## API Endpoints to Build

### Auth
POST /api/v1/auth/register   → { email, password, full_name, role }
POST /api/v1/auth/login      → { email, password } → { access_token, refresh_token }
POST /api/v1/auth/refresh    → { refresh_token } → { access_token }
GET  /api/v1/auth/me         → current user info

### Players
POST   /api/v1/players          → create player (parent only)
GET    /api/v1/players          → list with filters: region, age_min, age_max, position
GET    /api/v1/players/:id      → single player with anthropometrics
PUT    /api/v1/players/:id      → update player
DELETE /api/v1/players/:id      → delete (owner only)
GET    /api/v1/players/:id/rating → rating + percentiles by age

### Physical Tests
POST /api/v1/players/:id/tests  → add test session
GET  /api/v1/players/:id/tests  → list all sessions (sorted by date)

### Videos
POST /api/v1/players/:id/videos → upload video (multipart/form-data)
GET  /api/v1/players/:id/videos → list videos
GET  /api/v1/videos/:id/url     → get presigned playback URL (1h expiry)

## CORS Setup
Allow origins: http://localhost:5173 (Vite dev server)

## Docker Compose
Services: postgres, minio, backend (with hot reload via --reload)
Include: init script to create MinIO bucket on startup

## Tests (write alongside each endpoint)
tests/conftest.py:
- async_client fixture (httpx.AsyncClient)
- test_db fixture (separate SQLite for tests)
- factory fixtures: make_user(), make_player()

tests/test_auth.py:
- регистрация создает пользователя в БД
- логин возвращает JWT токен
- защищенный эндпоинт отклоняет запрос без токена
- рефреш токен обновляет access token

tests/test_players.py:
- создание игрока сохраняет все поля включая антропометрию
- список игроков фильтруется по региону
- список игроков фильтруется по возрасту
- чужой игрок недоступен для редактирования
- рейтинг возвращает percentile бейджи

## After Backend is Running — Frontend Migration
Replace in frontend:
1. src/mocks/ → src/api/ (axios instance with baseURL + JWT interceptor)
2. All useQuery hooks: swap mock fetchers for real API calls
3. Add token storage in localStorage + auto-refresh on 401
4. Add React Query error boundaries for API errors

## Workflow
1. docker compose up -d (postgres + minio)
2. alembic upgrade head (run migrations)  
3. uvicorn app.main:app --reload
4. pytest --asyncio-mode=auto (watch mode)

Start with: docker-compose.yml → database.py → User model → auth endpoints → tests GREEN → then Players.