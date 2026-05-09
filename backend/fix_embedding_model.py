"""One-time script to fix deprecated models in DB."""
from sqlalchemy import text
from app.db.session import SessionLocal

db = SessionLocal()
db.execute(text("UPDATE ai_settings SET chat_model = 'gemini-2.0-flash', embedding_model = 'gemini-embedding-001'"))
db.commit()
print("Done: ai_settings updated -> chat_model=gemini-2.0-flash, embedding_model=gemini-embedding-001")
db.close()
