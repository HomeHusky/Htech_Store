import httpx
from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import AISetting
from app.db.session import SessionLocal

def _get_telegram_credentials(db: Optional[Session] = None) -> tuple[str | None, str | None]:
    bot_token = settings.telegram_bot_token
    chat_id = settings.telegram_chat_id

    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        db_setting = db.get(AISetting, 1)
        if db_setting:
            if db_setting.telegram_bot_token:
                bot_token = db_setting.telegram_bot_token
            if db_setting.telegram_chat_id:
                chat_id = db_setting.telegram_chat_id
    except Exception:
        pass
    finally:
        if should_close:
            db.close()

    return bot_token, chat_id


async def send_telegram_message(message: str, db: Optional[Session] = None, token: str | None = None, chat_id: str | None = None) -> bool:
    bot_token = token
    target_chat_id = chat_id
    if not bot_token or not target_chat_id:
        bot_token, target_chat_id = _get_telegram_credentials(db)

    if not bot_token or not target_chat_id:
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {"chat_id": target_chat_id, "text": message}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload)
            return response.status_code == 200
    except Exception:
        return False


async def notify_human_support(message: str, db: Optional[Session] = None) -> bool:
    bot_token, chat_id = _get_telegram_credentials(db)
    if not bot_token or not chat_id:
        return False
    return await send_telegram_message(message, token=bot_token, chat_id=chat_id)
