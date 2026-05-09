from sqlalchemy import text
from app.db.session import engine

def sync():
    with engine.connect() as conn:
        with conn.begin():
            try:
                conn.execute(text("ALTER TABLE ai_settings ADD COLUMN google_client_id VARCHAR;"))
                print("Added google_client_id")
            except:
                pass
        with conn.begin():
            try:
                conn.execute(text("ALTER TABLE ai_settings ADD COLUMN database_url VARCHAR;"))
                print("Added database_url")
            except:
                pass
        with conn.begin():
            try:
                conn.execute(text("ALTER TABLE ai_settings ADD COLUMN system_prompt TEXT;"))
                print("Added system_prompt")
            except:
                pass
            
if __name__ == "__main__":
    sync()
