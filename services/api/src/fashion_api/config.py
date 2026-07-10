from functools import lru_cache
from pathlib import Path
from typing import Literal
from uuid import UUID

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    app_name: str = "Fashion Design AI API"
    app_version: str = "0.1.0"
    database_url: str = "postgresql+psycopg://fashion_app:fashion_app_local@127.0.0.1:5432/fashion_app"
    development_user_id: UUID = Field(default=UUID("00000000-0000-4000-8000-000000000001"))
    redis_url: str = "redis://127.0.0.1:6379/0"
    render_dispatch_enabled: bool = False
    render_provider: Literal["mock", "openai"] = "mock"
    render_storage_root: Path = Path(".data/render-assets")
    render_max_asset_bytes: int = 25 * 1024 * 1024
    openai_api_key: SecretStr | None = None
    openai_image_model: str = "gpt-image-2"


@lru_cache
def get_settings() -> Settings:
    return Settings()
