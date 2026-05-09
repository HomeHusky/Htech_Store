from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.models import Product, ProductVariant


def sync_product_min_price(db: Session, product_id: str) -> None:
    """Set `products.price` to the minimum price among its variants.

    If no variants exist, leave the product.price as-is.
    """
    stmt = select(func.min(ProductVariant.price)).where(ProductVariant.product_id == product_id)
    result = db.execute(stmt).scalar_one_or_none()
    if result is None:
        return
    prod = db.get(Product, product_id)
    if not prod:
        return
    try:
        min_price = int(result)
    except Exception:
        return
    if prod.price != min_price:
        prod.price = min_price
        db.add(prod)
