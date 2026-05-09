from app.db.base import Base
from app.db.session import engine
from app.models.models import ThemePalette, ThemeSetting
from sqlalchemy import text

with engine.connect() as conn:
    print("Dropping old theme_settings...")
    conn.execute(text('DROP TABLE IF EXISTS theme_settings CASCADE'))
    conn.commit()

print("Creating new theme tables...")
Base.metadata.create_all(bind=engine, tables=[ThemePalette.__table__, ThemeSetting.__table__])

print("Seeding default palettes...")
from app.db.session import SessionLocal
db = SessionLocal()

presets = [
    {
        "id": "professional",
        "name": "Professional",
        "is_preset": True,
        "light_main": "#FFFFFF", "light_sub": "#2C3E50", "light_accent": "#007AFF",
        "dark_main": "#0F172A", "dark_sub": "#1E293B", "dark_accent": "#3B82F6"
    },
    {
        "id": "gaming",
        "name": "Gaming",
        "is_preset": True,
        "light_main": "#121212", "light_sub": "#2D2D2D", "light_accent": "#FF4B2B",
        "dark_main": "#0A0A0A", "dark_sub": "#1A1A1A", "dark_accent": "#FF4B2B"
    },
    {
        "id": "creative",
        "name": "Creative",
        "is_preset": True,
        "light_main": "#F8F9FA", "light_sub": "#4A4E69", "light_accent": "#00BFA5",
        "dark_main": "#1A1A2E", "dark_sub": "#16213E", "dark_accent": "#00BFA5"
    }
]

for p in presets:
    if not db.get(ThemePalette, p["id"]):
        db.add(ThemePalette(**p))

setting = db.get(ThemeSetting, 1)
if not setting:
    db.add(ThemeSetting(id=1, active_palette_id="professional"))

db.commit()
db.close()
print("Done.")
