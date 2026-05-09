from functools import lru_cache

import httpx
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import OpenAIEmbeddings

from app.core.config import settings


@lru_cache
def get_gemini_embedding_client(model: str) -> GoogleGenerativeAIEmbeddings:
    return GoogleGenerativeAIEmbeddings(model=model, google_api_key=settings.gemini_api_key)


@lru_cache
def get_openai_embedding_client(model: str) -> OpenAIEmbeddings:
    api_key = settings.openai_api_key
    base_url = None
    
    if "text-embedding-3-small" in model.lower() and settings.openai_text_embed_3_small_key:
        api_key = settings.openai_text_embed_3_small_key
        # Check if it's GitHub PAT
        if api_key.startswith("github_pat_"):
            base_url = "https://models.inference.ai.azure.com"
            
    return OpenAIEmbeddings(model=model, api_key=api_key, openai_api_base=base_url)


def _embed_with_ollama(model: str, text: str) -> list[float]:
    payload = {"model": model, "prompt": text}
    with httpx.Client(timeout=30) as client:
        res = client.post(f"{settings.ollama_base_url}/api/embeddings", json=payload)
        res.raise_for_status()
        return res.json().get("embedding", [])


def embed_query(text: str, provider: str = "gemini", model: str = "models/gemini-embedding-2") -> list[float]:
    if provider == "openai":
        client = get_openai_embedding_client(model)
        vector = client.embed_query(text)
    elif provider == "ollama":
        vector = _embed_with_ollama(model, text)
    else:
        # Gemini specific handling
        actual_model = model
        if not actual_model.startswith("models/"):
            actual_model = f"models/{actual_model}"
        
        # Mapping requested names to known valid ones
        if "embedding-001" in actual_model:
            actual_model = "models/gemini-embedding-2"
        elif "embedding-2" in actual_model:
            actual_model = "models/gemini-embedding-2" 
            
        client = get_gemini_embedding_client(actual_model)
        vector = client.embed_query(text)
    if len(vector) > settings.embedding_dimension:
        return vector[: settings.embedding_dimension]
    if len(vector) < settings.embedding_dimension:
        return vector + [0.0] * (settings.embedding_dimension - len(vector))
    return vector


def vector_literal(vector: list[float]) -> str:
    return "[" + ",".join(f"{v:.8f}" for v in vector) + "]"
