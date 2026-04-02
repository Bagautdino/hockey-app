from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql+asyncpg://hockey:hockey@localhost:5432/hockey_db"
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "hockey-videos"
    MINIO_USE_SSL: bool = False
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins."""
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
