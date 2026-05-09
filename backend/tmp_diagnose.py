import traceback
from app.db.session import SessionLocal
from app.services.admin_service import get_all_products

try:
    db = SessionLocal()
    prods = get_all_products(db)
    print('products_count=', len(prods))
    for p in prods[:10]:
        print(p.id, p.slug, p.category)
except Exception:
    traceback.print_exc()
