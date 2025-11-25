"""Application configuration for TCE EduRide backend."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    app_name: str = "TCE EduRide API"
    api_v1_prefix: str = "/api/v1"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite:///./tce_eduride.db"
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:8081"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""
    return Settings()
