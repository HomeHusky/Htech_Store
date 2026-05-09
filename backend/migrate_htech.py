from app.db.session import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        print("Migrating Product table...")
        # Add new columns to products
        conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR DEFAULT \'Htech\''))
        conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS tagline JSON'))
        conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS highlight_specs JSON DEFAULT \'[]\''))
        conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE'))
        conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 10'))
        conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5'))
        conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0'))
        
        print("Migrating AI Settings table...")
        conn.execute(text('ALTER TABLE ai_settings ADD COLUMN IF NOT EXISTS telegram_bot_token VARCHAR'))
        conn.execute(text('ALTER TABLE ai_settings ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR'))

        print("Fixing RepairStatus Enum...")
        # Drop and recreate Enum is tricky if used. We'll try to add values if they don't exist.
        # But safest is to drop the column, drop the type, and let SQLAlchemy recreate it during seed if possible.
        # Or just use the 'received', 'testing' etc values.
        try:
            conn.execute(text("ALTER TYPE repair_status ADD VALUE 'received'"))
            conn.execute(text("ALTER TYPE repair_status ADD VALUE 'testing'"))
            conn.execute(text("ALTER TYPE repair_status ADD VALUE 'fixing'"))
            conn.execute(text("ALTER TYPE repair_status ADD VALUE 'ready'"))
            conn.execute(text("ALTER TYPE repair_status ADD VALUE 'delivered'"))
        except Exception:
            # Type might already have these or be different.
            pass

        conn.commit()
        print("Migration completed!")

if __name__ == "__main__":
    migrate()
