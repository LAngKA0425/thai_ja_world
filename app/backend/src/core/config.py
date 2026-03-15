from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://taeja:changeme@postgres:5432/taeja"
    REDIS_URL: str = "redis://redis:6379/0"
    SECRET_KEY: str = "super-secret-change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost"]
    FIRST_ADMIN_EMAIL: str = "admin@taeja.local"
    FIRST_ADMIN_PASSWORD: str = "admin1234"
    APP_ENV: str = "development"
    DEBUG: bool = True
    OPEN_KAKAO_URL: str = ""
    SYNC_DATABASE_URL: str = "postgresql://taeja:changeme@postgres:5432/taeja"
    SIGNUP_RISK_DEFAULT: str = "low"
    SIGNUP_RISK_SCORE_THRESHOLD: int = 70
    CAPTCHA_PROVIDER: str = ""
    CAPTCHA_SECRET: str = ""
    EMAIL_VERIFICATION_PROVIDER: str = ""
    SMS_VERIFICATION_PROVIDER: str = ""
    PASSKEY_RP_ID: str = ""
    PASSKEY_RP_ORIGIN: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
