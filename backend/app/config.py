from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql+asyncpg://hockey:hockey@localhost:5432/hockey_db"

    SECRET_KEY: str = "change-me"
    JWT_SECRET: str = ""
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_ROOT_USER: str = ""
    MINIO_ROOT_PASSWORD: str = ""
    MINIO_BUCKET: str = "hockey-videos"
    MINIO_USE_SSL: bool = False

    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def jwt_secret_key(self) -> str:
        """JWT secret: prefer JWT_SECRET (prod), fall back to SECRET_KEY (dev)."""
        return self.JWT_SECRET or self.SECRET_KEY

    @property
    def jwt_algorithm(self) -> str:
        """JWT algorithm: prefer JWT_ALGORITHM (prod), fall back to ALGORITHM (dev)."""
        return self.JWT_ALGORITHM or self.ALGORITHM

    @property
    def minio_access_key(self) -> str:
        """MinIO access key: prefer MINIO_ROOT_USER (prod), fall back to MINIO_ACCESS_KEY (dev)."""
        return self.MINIO_ROOT_USER or self.MINIO_ACCESS_KEY

    @property
    def minio_secret_key(self) -> str:
        """MinIO secret key: prefer MINIO_ROOT_PASSWORD (prod), fall back to MINIO_SECRET_KEY (dev)."""
        return self.MINIO_ROOT_PASSWORD or self.MINIO_SECRET_KEY

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins."""
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
