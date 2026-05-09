import sys
import os
import uuid
from datetime import date, datetime
from sqlalchemy.orm import Session

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.models import Order, OrderItem, Product, StoreProfile, OrderStatus

def seed():
    db = SessionLocal()
    try:
        # Seed Store Profile
        if not db.get(StoreProfile, 1):
            profile = StoreProfile(
                id=1,
                name="Htech Store",
                address="23 Đồng Khởi, District 1, Saigon",
                email="hello@htech.vn",
                bank_name="Vietcombank",
                bank_account="0123 456 789",
                bank_beneficiary="HTECH STORE"
            )
            db.add(profile)
            print("Seeded Store Profile.")

        # Seed Orders
        if db.query(Order).count() == 0:
            # Need a product to link to
            product = db.query(Product).first()
            if product:
                order_id = str(uuid.uuid4())
                order = Order(
                    id=order_id,
                    order_number="ML-2412",
                    customer="Linh Nguyễn",
                    email="linh.n@email.com",
                    phone="+84 901 234 567",
                    total=12500000,
                    deposit=2500000,
                    status=OrderStatus.PAID,
                    event_date=date(2026, 5, 18)
                )
                db.add(order)
                
                item = OrderItem(
                    id=str(uuid.uuid4()),
                    order_id=order_id,
                    product_id=product.id,
                    qty=1,
                    price=product.price,
                    days=1 if product.price_per_day else None
                )
                db.add(item)
                print("Seeded Order ML-2412.")

        db.commit()
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
