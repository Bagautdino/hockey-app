from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.repositories import user_repo
from app.schemas.user import (
    UserRegister,
    UserLogin,
    TokenPair,
    TokenRefresh,
    UserResponse,
)
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_token,
    decode_token,
    get_current_user,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    existing = await user_repo.get_user_by_email(db, body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email уже зарегистрирован",
        )
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
    )
    user = await user_repo.create_user(db, user)
    return user


@router.post("/login", response_model=TokenPair)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate and return JWT tokens."""
    user = await user_repo.get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )
    return TokenPair(
        access_token=create_token(user.id, "access"),
        refresh_token=create_token(user.id, "refresh"),
    )


@router.post("/refresh", response_model=TokenPair)
async def refresh(body: TokenRefresh, db: AsyncSession = Depends(get_db)):
    """Exchange a refresh token for a new token pair."""
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный refresh токен",
        )
    user = await user_repo.get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )
    return TokenPair(
        access_token=create_token(user.id, "access"),
        refresh_token=create_token(user.id, "refresh"),
    )


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    """Return current authenticated user."""
    return user
