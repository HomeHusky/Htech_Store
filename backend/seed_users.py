import sys
import os
import uuid

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.models import User, UserRole, UserPermission
from app.services.admin_service import get_password_hash

def seed():
    db = SessionLocal()
    try:
        # 1. Admin - Full permissions
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                email="admin@htech.vn",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                full_name="Quản trị viên",
                role=UserRole.ADMIN,
                permission=UserPermission.FULL
            )
            db.add(admin)
            print("Created admin user")

        # 2. Staff - Read only
        staff = db.query(User).filter(User.username == "staff").first()
        if not staff:
            staff = User(
                id=str(uuid.uuid4()),
                email="staff@htech.vn",
                username="staff",
                hashed_password=get_password_hash("staff123"),
                full_name="Nhân viên kỹ thuật",
                role=UserRole.STAFF,
                permission=UserPermission.READ_ONLY
            )
            db.add(staff)
            print("Created staff user")

        # 3. Guest - No admin access
        guest = db.query(User).filter(User.username == "guest").first()
        if not guest:
            guest = User(
                id=str(uuid.uuid4()),
                email="guest@htech.vn",
                username="guest",
                hashed_password=get_password_hash("guest123"),
                full_name="Khách hàng thân thiết",
                role=UserRole.USER,
                permission=UserPermission.NONE
            )
            db.add(guest)
            print("Created guest user")

        db.commit()
    except Exception as e:
        print(f"Error seeding users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
