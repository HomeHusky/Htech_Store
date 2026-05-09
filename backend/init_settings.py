from app.db.session import SessionLocal
from app.models.models import Base, StoreSetting
from app.db.base import engine

def init_settings():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        setting = db.query(StoreSetting).filter_by(id="default").first()
        if not setting:
            setting = StoreSetting(id="default", deposit_percentage=20)
            db.add(setting)
            db.commit()
            print("Store settings initialized with 20% deposit.")
        else:
            print("Store settings already exist.")
    finally:
        db.close()

if __name__ == "__main__":
    init_settings()
