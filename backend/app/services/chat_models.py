import httpx
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.admin_service import get_or_create_ai_settings
from app.services.system_prompt import build_system_prompt


async def _chat_with_openai(model: str, system_prompt: str, prompt: str) -> str:
    if not settings.openai_api_key:
        return "Chưa cấu hình OPENAI_API_KEY."

    is_github = settings.openai_api_key.startswith("github_pat_")
    base_url = "https://models.inference.ai.azure.com" if is_github else None
    llm = ChatOpenAI(
        model=model,
        openai_api_key=settings.openai_api_key,
        base_url=base_url,
        temperature=0.2,
        timeout=20,
        max_retries=0,
    )
    res = await llm.ainvoke([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
    return str(res.content).strip()


async def _chat_with_phi(model: str, system_prompt: str, prompt: str) -> str:
    api_key = settings.phi4_reasoning_api_key if "reasoning" in model.lower() else settings.phi4_api_key
    api_key = api_key or settings.phi4_api_key
    if not api_key:
        return f"Chưa cấu hình API key cho model {model}."

    llm = ChatOpenAI(
        model=model,
        openai_api_key=api_key,
        base_url="https://models.inference.ai.azure.com",
        temperature=0.2,
        timeout=20,
        max_retries=0,
    )
    res = await llm.ainvoke([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
    return str(res.content).strip()


async def _chat_with_ollama(model: str, system_prompt: str, prompt: str) -> str:
    payload = {
        "model": model,
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
    }
    async with httpx.AsyncClient(timeout=45) as client:
        res = await client.post(f"{settings.ollama_base_url}/api/chat", json=payload)
        res.raise_for_status()
        body = res.json()
        return body.get("message", {}).get("content", "").strip()


async def _chat_with_gemini(model: str, system_prompt: str, prompt: str) -> str:
    if not settings.gemini_api_key:
        return "Chưa cấu hình GEMINI_API_KEY."
    llm = ChatGoogleGenerativeAI(
        model=model,
        google_api_key=settings.gemini_api_key,
        temperature=0.2,
        timeout=20,
        max_retries=0,
    )
    res = await llm.ainvoke([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
    return str(res.content).strip()


def _looks_unusable(answer: str) -> bool:
    lowered = answer.lower()
    return not answer.strip() or "chưa cấu hình" in lowered or "not configured" in lowered


async def _chat_with_provider(provider: str, model: str, system_prompt: str, prompt: str) -> str:
    if provider == "ollama":
        return await _chat_with_ollama(model, system_prompt, prompt)
    if provider == "openai":
        return await _chat_with_openai(model, system_prompt, prompt)
    if provider == "phi4":
        return await _chat_with_phi(model, system_prompt, prompt)
    return await _chat_with_gemini(model, system_prompt, prompt)


def _task_override(cfg, task: str | None) -> tuple[str | None, str | None]:
    if not task or not cfg.task_model_config:
        return None, None
    item = cfg.task_model_config.get(task)
    if not isinstance(item, dict):
        return None, None
    return item.get("provider"), item.get("model")


def _model_order(cfg) -> list[dict[str, str]]:
    if isinstance(cfg.chat_model_order, list) and cfg.chat_model_order:
        return [
            {"provider": str(item.get("provider")), "model": str(item.get("model"))}
            for item in cfg.chat_model_order
            if isinstance(item, dict) and item.get("provider") and item.get("model")
        ]
    return [
        {"provider": cfg.chat_provider, "model": cfg.chat_model},
        {"provider": "openai", "model": "gpt-4o-mini"},
        {"provider": "phi4", "model": "Phi-4"},
    ]


async def generate_answer_with_config(
    db: Session,
    prompt: str,
    locale: str = "vi",
    provider: str | None = None,
    model: str | None = None,
    task: str | None = None,
) -> str:
    cfg = get_or_create_ai_settings(db)
    system_prompt = build_system_prompt(locale)
    task_provider, task_model = _task_override(cfg, task)
    candidates: list[dict[str, str]] = []
    selected_provider = provider or task_provider
    selected_model = model or task_model
    if selected_provider and selected_model:
        candidates.append({"provider": selected_provider, "model": selected_model})
    else:
        candidates.extend(_model_order(cfg)[: max(1, int(cfg.reasoning_model_count or 1))])

    last_error = None
    for candidate in candidates:
        try:
            answer = await _chat_with_provider(candidate["provider"], candidate["model"], system_prompt, prompt)
            if not _looks_unusable(answer):
                return answer
        except Exception as exc:
            last_error = exc
            print(f"Chat candidate error ({candidate['provider']}/{candidate['model']}): {exc}")

    if last_error:
        print(f"Chat error: {last_error}")
    return "Mình chưa tạo được câu trả lời từ model đang cấu hình."


async def generate_admin_configured_answer(db: Session, prompt: str, locale: str = "vi") -> str:
    cfg = get_or_create_ai_settings(db)
    return await generate_answer_with_config(db, prompt, locale=locale, provider=cfg.chat_provider, model=cfg.chat_model)


async def test_admin_configured_model(
    db: Session,
    prompt: str,
    provider: str | None = None,
    model: str | None = None,
    task: str | None = None,
) -> dict[str, str]:
    cfg = get_or_create_ai_settings(db)
    provider = provider or cfg.chat_provider
    model = model or cfg.chat_model
    answer = await generate_answer_with_config(db, prompt, provider=provider, model=model, task=task)
    return {
        "provider": provider,
        "model": model,
        "prompt": prompt,
        "answer": answer,
    }
