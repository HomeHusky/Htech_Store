import sys
import os
from sqlalchemy import text
from sqlalchemy.orm import Session

# Add current directory to path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal

def cleanup():
    db = SessionLocal()
    try:
        print("Cleaning up legacy categories and data...")
        
        # Delete items and orders first due to FK
        db.execute(text("TRUNCATE TABLE order_items CASCADE"))
        db.execute(text("TRUNCATE TABLE orders CASCADE"))
        db.execute(text("TRUNCATE TABLE products CASCADE"))
        db.execute(text("TRUNCATE TABLE categories CASCADE"))
        
        # Reset any other legacy tables if they exist
        tables = ["studio_profile", "product_reviews", "product_attributes", "faqs", "vouchers"]
        for table in tables:
            try:
                db.execute(text(f"TRUNCATE TABLE {table} CASCADE"))
                print(f"Truncated {table}")
            except Exception as e:
                print(f"Could not truncate {table}: {e}")
        
        db.commit()
        print("Cleanup successful.")
    except Exception as e:
        print(f"Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup()
