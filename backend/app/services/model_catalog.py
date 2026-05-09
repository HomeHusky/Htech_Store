from collections.abc import Iterable

import httpx

from app.core.config import settings
from app.schemas.admin import ModelOption, ProviderOption

DEFAULT_GEMINI_CHAT = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
]
DEFAULT_GEMINI_EMBED = ["gemini-embedding-001", "gemini_embedding-2"]
DEFAULT_OPENAI_CHAT = ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"]
DEFAULT_OPENAI_EMBED = ["text-embedding-3-small", "text-embedding-3-large"]


def _as_options(ids: Iterable[str]) -> list[ModelOption]:
    return [ModelOption(id=model_id, label=model_id) for model_id in sorted(set(ids))]


async def _fetch_ollama_models() -> list[str]:
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            res = await client.get(f"{settings.ollama_base_url}/api/tags")
            res.raise_for_status()
            data = res.json()
            return [m["name"].removesuffix(":latest") for m in data.get("models", []) if m.get("name")]
    except Exception:
        return ["qwen2.5", "llama3.2"]


async def _fetch_openai_chat_models() -> list[str]:
    if not settings.openai_api_key:
        return DEFAULT_OPENAI_CHAT
    try:
        headers = {"Authorization": f"Bearer {settings.openai_api_key}"}
        async with httpx.AsyncClient(timeout=8) as client:
            res = await client.get("https://api.openai.com/v1/models", headers=headers)
            res.raise_for_status()
            data = res.json().get("data", [])
            ids = [m["id"] for m in data if m.get("id", "").startswith("gpt-")]
            return ids or DEFAULT_OPENAI_CHAT
    except Exception:
        return DEFAULT_OPENAI_CHAT


async def get_model_catalog() -> tuple[list[ProviderOption], list[ProviderOption]]:
    ollama_models = await _fetch_ollama_models()
    openai_chat_models = await _fetch_openai_chat_models()

    chat_providers = [
        ProviderOption(id="ollama", label="Local Ollama", models=_as_options(ollama_models)),
        ProviderOption(id="gemini", label="Gemini", models=_as_options(DEFAULT_GEMINI_CHAT)),
        ProviderOption(id="openai", label="ChatGPT", models=_as_options(openai_chat_models)),
        ProviderOption(id="phi4", label="Phi 4 (GitHub)", models=_as_options(["Phi-4", "Phi-4-Reasoning"])),
    ]
    embedding_providers = [
        ProviderOption(id="ollama", label="Local Ollama", models=_as_options(ollama_models)),
        ProviderOption(id="gemini", label="Gemini", models=_as_options(DEFAULT_GEMINI_EMBED)),
        ProviderOption(id="openai", label="ChatGPT", models=_as_options(DEFAULT_OPENAI_EMBED)),
    ]
    return chat_providers, embedding_providers
