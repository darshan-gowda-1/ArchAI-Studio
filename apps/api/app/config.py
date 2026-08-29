"""
ArchAI Studio v3 - API Configuration
"""

import os

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "ArchAI Studio v3 API"
    environment: str = os.getenv("ENVIRONMENT", "development")
    api_port: int = int(os.getenv("API_PORT", 8000))
    database_url: str = os.getenv("DATABASE_URL", "postgresql://archai_admin:archai_secure_pass_2026@localhost:5432/archai_v3_db")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    api_secret_key: str = os.getenv("API_SECRET_KEY", "archai_secret_key_v3")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
