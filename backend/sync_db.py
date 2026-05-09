from sqlalchemy import text
from app.db.session import engine

def execute_sql(sql):
    with engine.connect() as conn:
        with conn.begin():
            try:
                conn.execute(text(sql))
                print("Success:", sql[:50], "...")
            except Exception as e:
                print("Skipped/Failed:", sql[:50], "...", type(e).__name__)

def sync():
    execute_sql("CREATE TYPE user_role AS ENUM ('GUEST', 'STAFF', 'ADMIN');")
    execute_sql("CREATE TYPE user_permission AS ENUM ('VIEW', 'EDIT');")
    
    execute_sql("""
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR PRIMARY KEY,
            email VARCHAR UNIQUE NOT NULL,
            full_name VARCHAR,
            role user_role NOT NULL DEFAULT 'GUEST',
            permission user_permission NOT NULL DEFAULT 'VIEW',
            google_id VARCHAR,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """)

    execute_sql("ALTER TABLE orders ADD COLUMN user_id VARCHAR REFERENCES users(id);")

if __name__ == "__main__":
    sync()
    print("Database sync complete.")
