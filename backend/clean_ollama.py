from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()
db.execute(text("UPDATE ai_settings SET chat_model = 'qwen2.5' WHERE chat_model = 'qwen2.5:latest'"))
db.execute(text("UPDATE ai_settings SET embedding_model = 'qwen2.5' WHERE embedding_model = 'qwen2.5:latest'"))
db.commit()
print("Cleaned up :latest in DB")
db.close()
