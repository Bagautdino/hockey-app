from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    """Registration request body."""

    email: EmailStr
    password: str
    full_name: str
    role: str = "parent"


class UserLogin(BaseModel):
    """Login request body."""

    email: EmailStr
    password: str


class TokenPair(BaseModel):
    """JWT access + refresh token pair."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Refresh token request body."""

    refresh_token: str


class UserResponse(BaseModel):
    """Public user info."""

    id: str
    email: str
    full_name: str
    role: str

    model_config = {"from_attributes": True}
