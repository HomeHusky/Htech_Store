from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Htech Store API"
    app_env: str = Field(default="development", alias="APP_ENV")
    app_debug: bool = Field(default=False, alias="APP_DEBUG")

    database_url: str = Field(alias="DATABASE_URL")
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_text_embed_3_small_key: str = Field(default="", alias="OPENAI_TEXT_EMBED_3_SMALL")
    phi4_api_key: str = Field(default="", alias="PHI4_API_KEY")
    phi4_reasoning_api_key: str = Field(default="", alias="PHI4_RESONING_API_KEY")
    ollama_base_url: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")

    telegram_bot_token: str | None = Field(default=None, alias="TELEGRAM_BOT_TOKEN")
    telegram_chat_id: str | None = Field(default=None, alias="TELEGRAM_CHAT_ID")

    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3001",
        alias="CORS_ORIGINS",
    )
    embedding_dimension: int = Field(default=768, alias="EMBEDDING_DIMENSION")
    hybrid_rrf_k: int = Field(default=60, alias="HYBRID_RRF_K")
    hybrid_limit: int = Field(default=8, alias="HYBRID_LIMIT")
    jwt_secret: str = Field(default="super-secret-key-htech-2026", alias="JWT_SECRET")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7 # 1 week

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
