from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE ai_settings ADD COLUMN IF NOT EXISTS google_client_id VARCHAR'))
    conn.execute(text('ALTER TABLE ai_settings ADD COLUMN IF NOT EXISTS google_client_secret VARCHAR'))
    conn.execute(text('ALTER TABLE ai_settings ADD COLUMN IF NOT EXISTS database_url VARCHAR'))
    conn.execute(text('ALTER TABLE ai_settings ADD COLUMN IF NOT EXISTS system_prompt TEXT'))
    conn.execute(text('ALTER TABLE store_profile ADD COLUMN IF NOT EXISTS facebook_link VARCHAR'))
    conn.execute(text('ALTER TABLE store_profile ADD COLUMN IF NOT EXISTS instagram_link VARCHAR'))
    
    # Create categories table
    conn.execute(text('CREATE TABLE IF NOT EXISTS categories (id VARCHAR PRIMARY KEY, slug VARCHAR UNIQUE NOT NULL, name JSON NOT NULL)'))
    
    # Update products table to use foreign key instead of enum
    # First, drop the old category column if it exists or rename it
    # But since it's a new DB, we can just alter it.
    conn.execute(text('ALTER TABLE products ALTER COLUMN category TYPE VARCHAR'))
    conn.execute(text('ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category) REFERENCES categories(id)'))
    
    conn.commit()
    print("Columns added successfully!")
