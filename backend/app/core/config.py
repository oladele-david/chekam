from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pydantic import field_validator


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
    CORS_ORIGINS: str | List[str] = "http://localhost:3000,http://localhost:5173,http://localhost:8080"
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: str | List[str] = "GET,POST,PUT,DELETE,PATCH"
    CORS_ALLOW_HEADERS: str | List[str] = "*"

    # Pagination Defaults
    DEFAULT_SKIP: int = 0
    DEFAULT_LIMIT: int = 10
    MAX_LIMIT: int = 100

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        env_parse_none_str="None",
    )

    @field_validator('CORS_ORIGINS', 'CORS_ALLOW_METHODS', 'CORS_ALLOW_HEADERS', mode='before')
    @classmethod
    def parse_cors_list(cls, v):
        """Parse comma-separated strings into lists."""
        if isinstance(v, str):
            return [item.strip() for item in v.split(',')]
        return v



settings = Settings()
