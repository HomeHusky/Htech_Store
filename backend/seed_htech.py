from app.db.session import SessionLocal
from app.models.models import AISetting, StoreProfile
from seed_htech_products import seed_products
from seed_htech_support_data import seed_support_data

def seed():
    db = SessionLocal()
    try:
        # 1. Update AI Settings
        ai_settings = db.query(AISetting).first()
        if not ai_settings:
            ai_settings = AISetting()
            db.add(ai_settings)
        
        ai_settings.system_prompt = """You are the AI sales concierge for Htech - High-end Computer & Phone Store.
Role: Help customers choose laptops, phones, PCs, and components.
Key items: Gaming laptops, MacBook, iPhone, Custom PC builds.
Style: Professional, tech-savvy, helpful.
Location: Hanoi, Vietnam.
"""
        # 2. Update Store Profile
        profile = db.query(StoreProfile).first()
        if not profile:
            profile = StoreProfile()
            db.add(profile)
        
        profile.name = "Htech"
        profile.address = "123 Tech Street, Hanoi"
        profile.email = "contact@Htech.vn"

        db.commit()

        # 3. Seed canonical products and the richer support data set
        try:
            seed_products()
        except Exception:
            pass

        db.expire_all()
        seed_support_data(db)

        print("Seed completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
