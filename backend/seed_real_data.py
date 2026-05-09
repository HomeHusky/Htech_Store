import uuid
from datetime import datetime, timedelta
from sqlalchemy import text
from app.db.session import SessionLocal
from app.models.models import (
    Category, Product, StoreProfile, StorePolicy, 
    AISetting, Order, OrderItem, OrderStatus, 
    ThemePalette, ThemeSetting, User, UserRole, UserPermission
)
from seed_htech_support_data import seed_support_data

def seed_real_data():
    db = SessionLocal()
    try:
        print("Cleaning up old data...")
        db.execute(text("TRUNCATE TABLE order_items CASCADE"))
        db.execute(text("TRUNCATE TABLE orders CASCADE"))
        db.execute(text("TRUNCATE TABLE products CASCADE"))
        db.execute(text("TRUNCATE TABLE categories CASCADE"))
        db.execute(text("TRUNCATE TABLE store_policies CASCADE"))
        db.execute(text("TRUNCATE TABLE chat_history CASCADE"))
        db.execute(text("TRUNCATE TABLE chat_sessions CASCADE"))
        db.execute(text("TRUNCATE TABLE product_reviews CASCADE"))
        db.execute(text("TRUNCATE TABLE product_attributes CASCADE"))
        db.execute(text("TRUNCATE TABLE product_variants CASCADE"))
        db.execute(text("TRUNCATE TABLE faqs CASCADE"))
        db.execute(text("TRUNCATE TABLE vouchers CASCADE"))
        db.commit()

        # 1. Categories
        print("Seeding categories...")
        categories = [
            Category(id="laptop", slug="laptop", name={"vi": "Laptop & MacBook", "en": "Laptops & MacBook"}),
            Category(id="phone", slug="phone", name={"vi": "Smartphone", "en": "Smartphones"}),
            Category(id="pc", slug="pc", name={"vi": "PC Gaming & Workstation", "en": "Gaming PCs"}),
            Category(id="component", slug="component", name={"vi": "Linh kiện PC", "en": "PC Components"}),
            Category(id="accessory", slug="accessory", name={"vi": "Phụ kiện công nghệ", "en": "Accessories"}),
            Category(id="repair", slug="repair", name={"vi": "Dịch vụ sửa chữa", "en": "Repair Services"}),
        ]
        db.add_all(categories)
        db.commit()

        # 2. Products
        print("Seeding products...")
        products = [
            Product(
                id=str(uuid.uuid4()),
                slug="macbook-air-m3-13-inch",
                sku="MACBOOK_AIR_M3_13_INCH",
                name={"vi": "MacBook Air M3 13 inch", "en": "MacBook Air M3 13-inch"},
                brand="Apple",
                category="laptop",
                tagline={"vi": "Siêu mỏng nhẹ, hiệu năng M3 vượt trội", "en": "Thin, light, powerful M3"},
                price=27990000,
                image="https://images.unsplash.com/photo-1611186871348-b1ec696e5237?auto=format&fit=crop&q=80&w=800",
                gallery=["https://images.unsplash.com/photo-1611186871348-b1ec696e5237?auto=format&fit=crop&q=80&w=800"],
                description={
                    "vi": "MacBook Air với chip M3 siêu mạnh mẽ, thiết kế mỏng nhẹ đẳng cấp.",
                    "en": "MacBook Air with M3 chip, incredibly thin and powerful design."
                },
                details={"vi": {"CPU": "Chip M3 8-core", "RAM": "8GB Unified Memory", "SSD": "256GB SSD"}, "en": {"CPU": "M3 chip"}},
                highlight_specs=["Chip M3", "8GB RAM", "256GB SSD", "Liquid Retina"],
                is_new=True,
                stock=15,
                rating=4.9,
                review_count=128,
                trending=True
            ),
            Product(
                id=str(uuid.uuid4()),
                slug="iphone-15-pro-max",
                sku="IPHONE_15_PRO_MAX",
                name={"vi": "iPhone 15 Pro Max 256GB", "en": "iPhone 15 Pro Max 256GB"},
                brand="Apple",
                category="phone",
                tagline={"vi": "Khung viền Titan, Chip A17 Pro mạnh mẽ", "en": "Titanium, A17 Pro Power"},
                price=30990000,
                image="https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800",
                gallery=["https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800"],
                description={
                    "vi": "Khung viền Titan siêu bền, chip A17 Pro mạnh mẽ nhất thế giới smartphone.",
                    "en": "Titanium design, A17 Pro chip, the most powerful smartphone ever."
                },
                details={"vi": {"Chip": "A17 Pro", "Camera": "48MP Main"}, "en": {"Chip": "A17 Pro"}},
                highlight_specs=["Titanium", "A17 Pro", "Camera 48MP", "USB-C"],
                is_new=True,
                stock=20,
                rating=4.8,
                review_count=342,
                trending=True
            ),
            Product(
                id=str(uuid.uuid4()),
                slug="rtx-4070-ti-super",
                sku="RTX_4070_TI_SUPER",
                name={"vi": "ASUS TUF RTX 4070 Ti Super", "en": "ASUS TUF RTX 4070 Ti Super"},
                brand="ASUS",
                category="component",
                tagline={"vi": "Hiệu năng đồ họa đỉnh cao 4K", "en": "4K Graphics Performance"},
                price=24500000,
                image="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800",
                gallery=["https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800"],
                description={"vi": "Hiệu năng đồ họa đỉnh cao với công nghệ DLSS 3.5.", "en": "Top-tier graphics with DLSS 3.5."},
                details={"vi": {"VRAM": "16GB GDDR6X", "Bus": "256-bit"}, "en": {"VRAM": "16GB"}},
                highlight_specs=["16GB GDDR6X", "DLSS 3.5", "TUF Durability"],
                is_new=False,
                stock=8,
                rating=4.9,
                review_count=56,
                trending=False
            ),
            Product(
                id=str(uuid.uuid4()),
                slug="vesa-custom-pc-build",
                sku="HTECH_GAMING_PC_I7_14700K",
                name={"vi": "Htech Gaming PC i7-14700K", "en": "Htech Gaming PC Build"},
                brand="Htech",
                category="pc",
                tagline={"vi": "Cấu hình chuyên game & đồ họa nặng", "en": "High-end Gaming & Workstation"},
                price=55000000,
                image="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800",
                gallery=["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800"],
                description={"vi": "PC lắp ráp cao cấp cho stream và gaming 4K.", "en": "Custom PC for streaming and 4K gaming."},
                details={"vi": {"CPU": "Intel i7-14700K", "GPU": "RTX 4080"}, "en": {"CPU": "i7-14700K"}},
                highlight_specs=["i7-14700K", "32GB RAM", "RTX 4080"],
                is_new=True,
                stock=5,
                rating=5.0,
                review_count=12,
                trending=True
            ),
            Product(
                id=str(uuid.uuid4()),
                slug="vga-repair-service",
                sku="VGA_REPAIR_SERVICE",
                name={"vi": "Sửa chữa card đồ họa (VGA)", "en": "VGA Repair Service"},
                brand="Htech",
                category="repair",
                tagline={"vi": "Dịch vụ sửa chữa phần cứng chuyên sâu", "en": "Professional Hardware Repair"},
                price=500000,
                image="https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&q=80&w=800",
                gallery=["https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&q=80&w=800"],
                description={"vi": "Xử lý các lỗi rác hình, mất nguồn, thay keo tản nhiệt.", "en": "Fixing artifacts, power issues, re-pasting."},
                details={"vi": {"Bảo hành": "3 tháng", "Linh kiện": "Chính hãng"}, "en": {"Warranty": "3 months"}},
                highlight_specs=["Bảo hành 3 tháng", "Linh kiện zin", "Nhanh chóng"],
                is_new=False,
                stock=999,
                rating=4.7,
                review_count=89,
                trending=False
            )
        ]
        db.add_all(products)
        db.commit()

        # 3. Store Profile
        print("Updating store profile...")
        profile = db.query(StoreProfile).first()
        if not profile:
            profile = StoreProfile(id=1)
            db.add(profile)
        
        profile.name = "Htech Store"
        profile.address = "89 Đ. Trần Quang Khải, Tân Định, Quận 1, Hồ Chí Minh"
        profile.email = "support@htech.vn"
        profile.bank_name = "Techcombank"
        profile.bank_account = "1903 555 888 999"
        profile.bank_beneficiary = "CONG TY TNHH HTECH VIET NAM"
        profile.facebook_link = "https://facebook.com/htechstore"
        profile.instagram_link = "https://instagram.com/htechstore"
        
        # 4. Store Policies
        print("Seeding store policies...")
        policies = [
            StorePolicy(
                id="policy_warranty",
                policy_type="warranty",
                locale="vi",
                title="Chính sách Bảo hành",
                content="""# Chính sách Bảo hành tại Htech Store
                
                ## 1. Thời gian bảo hành
                - Laptop & PC: 12-36 tháng tùy linh kiện.
                - Linh kiện lẻ: Theo tiêu chuẩn nhà sản xuất.
                - Dịch vụ sửa chữa: 03 tháng.
                
                ## 2. Điều kiện bảo hành
                - Sản phẩm còn nguyên tem bảo hành của Htech.
                - Không bị rơi vỡ, vào nước hoặc can thiệp phần cứng trái phép.
                """
            ),
            StorePolicy(
                id="policy_shipping",
                policy_type="shipping",
                locale="vi",
                title="Giao hàng & Thanh toán",
                content="""# Giao hàng & Thanh toán
                
                ## 1. Giao hàng
                - Nội thành TP.HCM: Giao nhanh trong 2h.
                - Toàn quốc: 2-3 ngày làm việc qua GHN/Viettel Post.
                
                ## 2. Thanh toán
                - Chấp nhận chuyển khoản, thẻ tín dụng, và trả góp 0%.
                - Đặt cọc 20% cho các đơn hàng build PC theo yêu cầu.
                """
            )
        ]
        db.add_all(policies)

        # 5. Realistic Orders for Analytics
        print("Seeding orders for analytics...")
        now = datetime.now()
        for i in range(20):
            order_date = now - timedelta(days=20-i)
            order_id = str(uuid.uuid4())
            price = 1000000 + (i * 2000000)
            order = Order(
                id=order_id,
                order_number=f"HT-{1000 + i}",
                customer=f"Khách hàng {i+1}",
                email=f"customer{i+1}@gmail.com",
                phone=f"090{i}123456",
                total=price,
                deposit=price // 5,
                status=OrderStatus.COMPLETED if i < 15 else OrderStatus.PAID,
                event_date=order_date.date(),
                created_at=order_date
            )
            db.add(order)
            
            item = OrderItem(
                id=str(uuid.uuid4()),
                order_id=order_id,
                product_id=products[i % len(products)].id,
                qty=1,
                price=price
            )
            db.add(item)

        db.commit()

        # 6. Support data for search, chat, reviews, and filters
        seed_support_data(db)

        print("All data successfully seeded with real content!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_real_data()
