"""
ArchAI Studio - Enterprise Server Configuration & Settings
Secure environment variable loading for OpenAI, Meshy, Google Solar, Autodesk APS, Speckle, and Storage
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Information
    APP_NAME: str = "ArchAI Studio Enterprise API"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_V1_STR: str = "/api/v1"
    
    # 1. Core AI (OpenAI API)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    
    # 2. 3D Asset Generation (Meshy API)
    MESHY_API_KEY: Optional[str] = os.getenv("MESHY_API_KEY", "")
    MESHY_BASE_URL: str = "https://api.meshy.ai/v2"
    
    # 3. Solar & Geospatial (Google Maps & Solar API)
    GOOGLE_MAPS_API_KEY: Optional[str] = os.getenv("GOOGLE_MAPS_API_KEY", "")
    GOOGLE_SOLAR_API_KEY: Optional[str] = os.getenv("GOOGLE_SOLAR_API_KEY", "")
    
    # 4. BIM Cloud Automation (Autodesk Platform Services)
    AUTODESK_CLIENT_ID: Optional[str] = os.getenv("AUTODESK_CLIENT_ID", "")
    AUTODESK_CLIENT_SECRET: Optional[str] = os.getenv("AUTODESK_CLIENT_SECRET", "")
    AUTODESK_BASE_URL: str = "https://developer.api.autodesk.com"
    
    # 5. Collaborative Open BIM (Speckle API)
    SPECKLE_TOKEN: Optional[str] = os.getenv("SPECKLE_TOKEN", "")
    SPECKLE_SERVER_URL: str = os.getenv("SPECKLE_SERVER_URL", "https://app.speckle.systems")
    
    # 6. GIS & Mapbox
    MAPBOX_ACCESS_TOKEN: Optional[str] = os.getenv("MAPBOX_ACCESS_TOKEN", "")
    
    # 7. Database & Caching
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://archai:archai_secure_pass@localhost:5432/archai_db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # 8. Zero-Binary Object Storage (AWS S3 / Cloudflare R2)
    S3_ENDPOINT: Optional[str] = os.getenv("S3_ENDPOINT", "https://archai.r2.cloudflarestorage.com")
    S3_ACCESS_KEY: Optional[str] = os.getenv("S3_ACCESS_KEY", "")
    S3_SECRET_KEY: Optional[str] = os.getenv("S3_SECRET_KEY", "")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "archai-production-models")
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
