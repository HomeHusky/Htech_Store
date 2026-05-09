from sqlalchemy import text
from app.db.session import engine

def sync():
    with engine.connect() as conn:
        with conn.begin():
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR UNIQUE;"))
                print("Added username")
            except Exception as e:
                print("Username column may exist:", e)
        
        with conn.begin():
            try:
                conn.execute(text("UPDATE users SET username = email WHERE username IS NULL;"))
                print("Updated existing usernames to email")
            except Exception:
                pass
                
        with conn.begin():
            try:
                conn.execute(text("ALTER TABLE users ALTER COLUMN username SET NOT NULL;"))
            except Exception as e:
                pass
                
        with conn.begin():
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR;"))
                print("Added hashed_password")
            except Exception as e:
                print("Hashed_password column may exist:", e)

if __name__ == "__main__":
    sync()
