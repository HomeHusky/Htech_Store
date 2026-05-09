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
        "slug": "lumiere-lace-gown",
        "name": {"en": "Lumière Lace Gown", "vi": "Đầm Cưới Ren Lumière"},
        "category": "Dress",
        "price": 1200000,
        "price_per_day": True,
        "image": "/images/dress-1.jpg",
        "gallery": ["/images/dress-1.jpg", "/images/hero-dress.jpg", "/images/hero-bride.jpg"],
        "description": {
            "en": "A heirloom-inspired lace gown with hand-stitched ivory embroidery and a soft chapel train.",
            "vi": "Đầm ren lấy cảm hứng di sản với thêu tay màu ngà và đuôi nhà nguyện mềm mại."
        },
        "details": {
            "en": ["Ivory French lace", "Pearl button back", "Bust 84-92cm · Waist 64-72cm"],
            "vi": ["Ren Pháp màu ngà", "Lưng cúc ngọc trai", "Vòng 1 84-92cm · Eo 64-72cm"]
        },
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
        "gallery": ["/images/dress-2.jpg", "/images/hero-bride.jpg"],
        "description": {
            "en": "Blush peach silk slip with a fluid bias cut.",
            "vi": "Đầm lụa hồng đào cắt xéo mềm mại."
        },
        "details": {
            "en": ["Pure mulberry silk", "Adjustable straps"],
            "vi": ["Lụa tơ tằm nguyên chất", "Dây vai điều chỉnh"]
        },
        "available": True,
        "trending": True,
        "discount": 15,
    },
    {
        "id": "p3",
        "slug": "monsieur-navy-suit",
        "name": {"en": "Monsieur Navy Three-Piece", "vi": "Vest Navy Monsieur 3 Mảnh"},
        "category": "Suit",
        "price": 1100000,
        "price_per_day": True,
        "image": "/images/dress-3.jpg",
        "gallery": ["/images/dress-3.jpg"],
        "description": {
            "en": "A classic navy three-piece with peak lapels.",
            "vi": "Bộ vest navy 3 mảnh cổ điển với ve đỉnh."
        },
        "details": {
            "en": ["Italian wool blend", "Peak lapels"],
            "vi": ["Pha len Ý", "Ve đỉnh"]
        },
        "available": True,
        "discount": 20,
    },
    {
        "id": "p4",
        "slug": "ao-dai-heritage",
        "name": {"en": "Áo Dài Heritage", "vi": "Áo Dài Di Sản"},
        "category": "Dress",
        "price": 880000,
        "price_per_day": True,
        "image": "/images/dress-4.jpg",
        "gallery": ["/images/dress-4.jpg"],
        "description": {
            "en": "A traditional Vietnamese áo dài in ivory silk.",
            "vi": "Áo dài truyền thống bằng lụa ngà."
        },
        "details": {
            "en": ["Hand embroidery", "Pure silk"],
            "vi": ["Thêu thủ công", "Lụa nguyên chất"]
        },
        "available": True,
        "trending": True,
    },
    {
        "id": "pk1",
        "slug": "golden-hour-package",
        "name": {"en": "Golden Hour — Pre-Wedding", "vi": "Khoảnh Khắc Vàng — Chụp Trước Cưới"},
        "category": "Package",
        "price": 12500000,
        "price_per_day": False,
        "image": "/images/package-1.jpg",
        "gallery": ["/images/package-1.jpg", "/images/hero-couple.jpg"],
        "description": {
            "en": "A 4-hour pre-wedding shoot at the location of your choice.",
            "vi": "Buổi chụp trước cưới 4 giờ tại địa điểm bạn chọn."
        },
        "details": {
            "en": ["4 hours of shooting", "80 retouched photos"],
            "vi": ["4 giờ chụp", "80 ảnh đã chỉnh sửa"]
        },
        "available": True,
        "trending": True,
    },
    {
        "id": "pk2",
        "slug": "intimate-engagement",
        "name": {"en": "Intimate Engagement", "vi": "Đính Hôn Riêng Tư"},
        "category": "Package",
        "price": 6800000,
        "price_per_day": False,
        "image": "/images/package-2.jpg",
        "gallery": ["/images/package-2.jpg"],
        "description": {
            "en": "A 90-minute storytelling session in a café.",
            "vi": "Buổi chụp kể chuyện 90 phút tại quán cà phê."
        },
        "details": {
            "en": ["90 minutes", "40 retouched photos"],
            "vi": ["90 phút", "40 ảnh đã chỉnh sửa"]
        },
        "available": True,
        "discount": 10,
    },
    {
        "id": "pk3",
        "slug": "atelier-store-portrait",
        "name": {"en": "Atelier Store Portrait", "vi": "Chân Dung Store Atelier"},
        "category": "Package",
        "price": 4500000,
        "price_per_day": False,
        "image": "/images/package-3.jpg",
        "gallery": ["/images/package-3.jpg"],
        "description": {
            "en": "Editorial-style store portraits.",
            "vi": "Chân dung store phong cách tạp chí."
        },
        "details": {
            "en": ["2 hours store", "Hair & makeup included"],
            "vi": ["2 giờ store", "Bao gồm tóc & trang điểm"]
        },
        "available": True,
    }
]

orders_seed = [
    {
        "id": "ML-2412",
        "order_number": "ML-2412",
        "customer": "Linh Nguyễn",
        "email": "linh.n@email.com",
        "phone": "+84 901 234 567",
        "total": 12500000,
        "deposit": 2500000,
        "status": OrderStatus.PAID,
        "event_date": date(2026, 5, 18),
        "items": [{"productId": "pk1", "qty": 1, "price": 12500000}]
    },
    {
        "id": "ML-2411",
        "order_number": "ML-2411",
        "customer": "An Trần",
        "email": "an.tran@email.com",
        "phone": "+84 902 555 121",
        "total": 3600000,
        "deposit": 720000,
        "status": OrderStatus.AWAITING_DEPOSIT,
        "event_date": date(2026, 5, 4),
        "items": [{"productId": "p1", "qty": 1, "price": 1200000, "days": 3}]
    },
    {
        "id": "ML-2410",
        "order_number": "ML-2410",
        "customer": "Mai Phạm",
        "email": "mai.p@email.com",
        "phone": "+84 903 880 044",
        "total": 8560000,
        "deposit": 1712000,
        "status": OrderStatus.SERVICE_ONGOING,
        "event_date": date(2026, 4, 26),
        "items": [
            {"productId": "p4", "qty": 1, "price": 880000, "days": 2},
            {"productId": "pk2", "qty": 1, "price": 6800000}
        ]
    }
]

def seed():
    db = SessionLocal()
    try:
        # Seed Products
        for p_data in products_seed:
            p_data["category"] = p_data["category"].upper()
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
                        price=i_data["price"],
                        days=i_data.get("days")
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
