from sqlalchemy import text
from app.db.session import SessionLocal

def drop_all():
    db = SessionLocal()
    tables = [
        'order_items', 'orders', 'products', 'categories', 
        'studio_profile', 'store_profile', 'store_policies', 
        'vouchers', 'users', 'chat_history', 'chat_sessions', 
        'faqs', 'product_reviews', 'product_attributes', 
        'product_variants', 'repairs', 'repair_notes', 
        'store_settings', 'theme_palettes', 'theme_settings', 
        'ai_settings', 'alembic_version'
    ]
    for t in tables:
        try:
            db.execute(text(f"DROP TABLE IF EXISTS {t} CASCADE"))
        except Exception:
            pass
            
    types = ['category', 'order_status', 'user_role', 'user_permission', 'repair_status']
    for t in types:
        try:
            db.execute(text(f"DROP TYPE IF EXISTS {t} CASCADE"))
        except Exception:
            pass

    functions = [
        "products_search_vector_update", 
        "store_policies_search_vector_update"
    ]
    for f in functions:
        try:
            db.execute(text(f"DROP FUNCTION IF EXISTS {f} CASCADE"))
        except Exception:
            pass
            
    db.commit()
    db.close()
    print("Dropped all application tables and types.")

if __name__ == "__main__":
    drop_all()
