import httpx
from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import AISetting
from app.db.session import SessionLocal

async def notify_human_support(message: str, db: Optional[Session] = None) -> None:
    bot_token = settings.telegram_bot_token
    chat_id = settings.telegram_chat_id

    # Try to get from DB
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

    if not bot_token or not chat_id:
        return

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(url, json=payload)
