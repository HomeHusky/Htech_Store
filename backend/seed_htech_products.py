import uuid
from app.db.session import SessionLocal
from app.models.models import Category, Product

SAMPLE_PRODUCTS = [
    {
        "id": "htech-laptop-1",
        "slug": "asus-rog-strix-g16",
        "name": {"vi": "ASUS ROG Strix G16", "en": "ASUS ROG Strix G16"},
        "brand": "ASUS",
        "category": "laptop",
        "price": 36990000,
        "image": "/images/asus-rog-g16.jpg",
        "gallery": ["/images/asus-rog-g16.jpg"],
        "description": {"vi": "Laptop gaming hiệu năng cao", "en": "High performance gaming laptop"},
        "details": {
            "cpu": "Intel Core i9-13900HX",
            "gpu": "NVIDIA RTX 4070",
            "ram": "32GB DDR5",
            "storage": "1TB NVMe",
            "screen": "16\" 240Hz",
        },
        "highlight_specs": ["i9-13900HX", "RTX 4070", "32GB RAM"],
        "available": True,
        "trending": True,
        "discount": 5,
        "stock": 8,
    },
    {
        "id": "htech-phone-1",
        "slug": "iphone-15-pro",
        "name": {"vi": "iPhone 15 Pro", "en": "iPhone 15 Pro"},
        "brand": "Apple",
        "category": "phone",
        "price": 30990000,
        "image": "/images/iphone-15-pro.jpg",
        "gallery": ["/images/iphone-15-pro.jpg"],
        "description": {"vi": "iPhone mới nhất", "en": "Latest iPhone"},
        "details": {
            "cpu": "A17 Pro",
            "ram": "8GB",
            "storage": "256GB",
            "screen": "6.1\" OLED",
        },
        "highlight_specs": ["A17 Pro", "256GB"],
        "available": True,
        "trending": True,
        "discount": 0,
        "stock": 25,
    },
    {
        "id": "htech-pc-1",
        "slug": "custom-gaming-pc-ryzen",
        "name": {"vi": "Custom Gaming PC (Ryzen)", "en": "Custom Gaming PC (Ryzen)"},
        "brand": "Htech",
        "category": "pc",
        "price": 45990000,
        "image": "/images/custom-pc.jpg",
        "gallery": ["/images/custom-pc.jpg"],
        "description": {"vi": "Dàn máy custom cho game thủ", "en": "Custom gaming rig"},
        "details": {
            "cpu": "AMD Ryzen 9 7950X",
            "gpu": "NVIDIA RTX 4080",
            "ram": "32GB DDR5",
            "storage": "2TB NVMe",
        },
        "highlight_specs": ["Ryzen 9", "RTX 4080"],
        "available": True,
        "trending": False,
        "discount": 10,
        "stock": 3,
    }
]


def seed_products():
    db = SessionLocal()
    try:
        # Ensure canonical categories exist
        cats = [
            {"id": "laptop", "slug": "laptop", "name": {"vi": "Laptop", "en": "Laptop"}},
            {"id": "phone", "slug": "phone", "name": {"vi": "Điện thoại", "en": "Phone"}},
            {"id": "pc", "slug": "pc", "name": {"vi": "Máy tính để bàn", "en": "Desktop PC"}},
            {"id": "tablet", "slug": "tablet", "name": {"vi": "Máy tính bảng", "en": "Tablet"}},
        ]
        for c in cats:
            existing = db.get(Category, c["id"])
            if not existing:
                db.add(Category(id=c["id"], slug=c["slug"], name=c["name"]))

        # Seed sample products
        for pdata in SAMPLE_PRODUCTS:
            existing = db.get(Product, pdata["id"])
            if not existing:
                prod = Product(
                    id=pdata["id"],
                    slug=pdata["slug"],
                    sku=pdata["slug"].upper().replace("-", "_"),
                    name=pdata["name"],
                    brand=pdata.get("brand", "Htech"),
                    category=pdata["category"],
                    price=pdata["price"],
                    image=pdata.get("image", "/placeholder.svg"),
                    gallery=pdata.get("gallery", []),
                    description=pdata.get("description", {"vi": "", "en": ""}),
                    details=pdata.get("details", {}),
                    highlight_specs=pdata.get("highlight_specs", []),
                    available=pdata.get("available", True),
                    trending=pdata.get("trending", False),
                    discount=pdata.get("discount", 0),
                    stock=pdata.get("stock", 10),
                )
                db.add(prod)
        db.commit()
        print("Seeded Htech canonical products and categories.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding htech products: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_products()
