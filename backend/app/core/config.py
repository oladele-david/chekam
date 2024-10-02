from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """App settings"""

    PROJECT_NAME: str = "Chekam"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()
