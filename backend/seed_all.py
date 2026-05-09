import sys
import os
import uuid
from datetime import date, datetime
from sqlalchemy.orm import Session

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.models import Product, Order, OrderItem, OrderStatus, Category

products_seed = [
    {
        "id": "p1",
        "slug": "macbook-pro-m3",
        "name": {"en": "MacBook Pro M3", "vi": "MacBook Pro M3"},
        "category": "LAPTOP",
        "brand": "Apple",
        "price": 39990000,
        "is_trade_in": True,
        "image": "/images/macbook-m3.jpg",
        "gallery": ["/images/macbook-m3.jpg"],
        "description": {
            "en": "The most advanced chips ever built for a personal computer.",
            "vi": "Chip tiên tiến nhất từng được chế tạo cho máy tính cá nhân."
        },
        "details": {
            "en": ["M3 Chip", "8GB Unified Memory", "512GB SSD"],
            "vi": ["Chip M3", "8GB RAM", "512GB SSD"]
        },
        "available": True,
        "trending": True,
        "discount": 0,
    },
    {
        "id": "p2",
        "slug": "iphone-15-pro",
        "name": {"en": "iPhone 15 Pro", "vi": "iPhone 15 Pro"},
        "category": "MOBILE",
        "brand": "Apple",
        "price": 28990000,
        "is_trade_in": True,
        "image": "/images/iphone-15.jpg",
        "gallery": ["/images/iphone-15.jpg"],
        "description": {
            "en": "Forged in titanium and featuring the groundbreaking A17 Pro chip.",
            "vi": "Đúc từ titan và sở hữu chip A17 Pro đột phá."
        },
        "details": {
            "en": ["Titanium design", "A17 Pro chip", "Pro camera system"],
            "vi": ["Thiết kế Titan", "Chip A17 Pro", "Hệ thống camera Pro"]
        },
        "available": True,
        "trending": True,
        "discount": 5,
    },
    {
        "id": "p3",
        "slug": "airpods-pro-2",
        "name": {"en": "AirPods Pro (2nd gen)", "vi": "AirPods Pro (Thế hệ 2)"},
        "category": "ACCESSORY",
        "brand": "Apple",
        "price": 5990000,
        "is_trade_in": False,
        "image": "/images/airpods-pro.jpg",
        "gallery": ["/images/airpods-pro.jpg"],
        "description": {
            "en": "Rebuilt from the sound up.",
            "vi": "Tái tạo âm thanh từ nền tảng."
        },
        "details": {
            "en": ["H2 chip", "Active Noise Cancellation", "Personalized Spatial Audio"],
            "vi": ["Chip H2", "Chống ồn chủ động", "Âm thanh không gian cá nhân hóa"]
        },
        "available": True,
        "discount": 10,
    }
]

orders_seed = [
    {
        "id": "ML-3001",
        "order_number": "HT-3001",
        "customer": "Linh Nguyễn",
        "email": "linh.n@email.com",
        "phone": "+84 901 234 567",
        "total": 39990000,
        "deposit": 8000000,
        "status": OrderStatus.PAID,
        "expected_delivery": date(2026, 5, 18),
        "items": [{"productId": "p1", "qty": 1, "price": 39990000}]
    }
]

def seed():
    db = SessionLocal()
    try:
        # Seed Products
        for p_data in products_seed:
            existing = db.get(Product, p_data["id"])
            if existing:
                for key, value in p_data.items():
                    setattr(existing, key, value)
            else:
                db.add(Product(**p_data))
        
        db.commit()
        print(f"Seeded {len(products_seed)} products.")

        # Seed Orders
        for o_data in orders_seed:
            items_data = o_data.pop("items")
            existing = db.get(Order, o_data["id"])
            if not existing:
                order = Order(**o_data)
                db.add(order)
                for i_data in items_data:
                    item = OrderItem(
                        id=str(uuid.uuid4()),
                        order_id=order.id,
                        product_id=i_data["productId"],
                        qty=i_data["qty"],
                        price=i_data["price"]
                    )
                    db.add(item)
            else:
                print(f"Order {o_data['id']} already exists.")

        db.commit()
        print(f"Seeded {len(orders_seed)} orders.")

    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
