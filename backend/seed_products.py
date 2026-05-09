import sys
import os
import uuid
from sqlalchemy.orm import Session

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.models import Product

products_seed = [
    {
        "id": "p1",
        "slug": "lumiere-lace-gown",
        "name": {"en": "Lumière Lace Gown", "vi": "Đầm Cưới Ren Lumière"},
        "category": "Dress",
        "price": 1200000,
        "price_per_day": True,
        "image": "/images/dress-1.jpg",
        "gallery": ["/images/dress-1.jpg", "/images/hero-dress.jpg"],
        "description": {"en": "A heirloom-inspired lace gown.", "vi": "Đầm ren lấy cảm hứng di sản."},
        "details": {"en": ["Ivory French lace"], "vi": ["Ren Pháp màu ngà"]},
        "available": True,
        "trending": True,
        "discount": 0,
    },
    {
        "id": "p2",
        "slug": "peche-silk-evening",
        "name": {"en": "Pêche Silk Evening", "vi": "Đầm Lụa Pêche Buổi Tối"},
        "category": "Dress",
        "price": 950000,
        "price_per_day": True,
        "image": "/images/dress-2.jpg",
        "gallery": ["/images/dress-2.jpg"],
        "description": {"en": "Blush peach silk slip.", "vi": "Đầm lụa hồng đào."},
        "details": {"en": ["Pure mulberry silk"], "vi": ["Lụa tơ tằm"]},
        "available": True,
        "trending": True,
        "discount": 15,
    },
    {
        "id": "pk1",
        "slug": "golden-hour-package",
        "name": {"en": "Golden Hour — Pre-Wedding", "vi": "Khoảnh Khắc Vàng — Chụp Trước Cưới"},
        "category": "Package",
        "price": 12500000,
        "price_per_day": False,
        "image": "/images/package-1.jpg",
        "gallery": ["/images/package-1.jpg"],
        "description": {"en": "A 4-hour pre-wedding shoot.", "vi": "Buổi chụp trước cưới 4 giờ."},
        "details": {"en": ["4 hours of shooting"], "vi": ["4 giờ chụp"]},
        "available": True,
        "trending": True,
        "discount": 0,
    }
]

def seed():
    db = SessionLocal()
    try:
        for p_data in products_seed:
            existing = db.get(Product, p_data["id"])
            if not existing:
                product = Product(**p_data)
                db.add(product)
        db.commit()
        print("Seeded initial products.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
