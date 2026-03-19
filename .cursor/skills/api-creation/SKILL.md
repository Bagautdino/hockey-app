# API Creation Skill

## Description
Skill for creating FastAPI endpoints for the Hockey Parent platform.
Backend stack: Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Pydantic v2.

## Instructions
1. Always create Pydantic schemas in `schemas/` before writing endpoints
2. Endpoint structure: router → service → repository (3 layers)
3. All routes must have: type hints, docstring, HTTP status codes
4. Use async/await for all DB operations
5. Validate file uploads: max 500MB, allowed formats mp4/mov/avi
6. Return errors as `{"detail": "message"}` with correct HTTP codes
7. Add JWT auth dependency `Depends(get_current_user)` to protected routes
8. Never hardcode secrets — use `settings = Settings()` from config.py

## Templates
### Basic endpoint template:
```python
@router.post("/players", response_model=PlayerResponse, status_code=201)
async def create_player(
    data: PlayerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new player profile."""
    return await player_service.create(db, data, owner_id=current_user.id)
```

## Notes
- DB migrations via Alembic only, never alter tables manually
- All media stored in S3-compatible storage (MinIO), not local disk