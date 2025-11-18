from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Application settings and configuration.

    All settings can be overridden via environment variables.
    Sensitive settings (SECRET_KEY, DATABASE_URL) must be set via .env file.
    """

    # Application Info
    PROJECT_NAME: str = "Chekam"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"  # development, staging, production
    DEBUG: bool = False

    # Database Configuration
    DATABASE_URL: str
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 40
    DB_POOL_PRE_PING: bool = True
    DB_ECHO: bool = False  # Set to True for SQL query debugging

    # Security Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 180  # 3 hours

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # Pagination Defaults
    DEFAULT_SKIP: int = 0
    DEFAULT_LIMIT: int = 10
    MAX_LIMIT: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
