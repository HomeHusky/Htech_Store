from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import Voucher


def verify_voucher(db: Session, code: str, subtotal: int | None = None) -> dict:
    voucher = db.scalar(select(Voucher).where(Voucher.code == code))
    if not voucher:
        return {"valid": False, "code": code, "reason": "Voucher not found"}
    if not voucher.active:
        return {"valid": False, "code": code, "reason": "Voucher inactive"}
    if voucher.expires_at and voucher.expires_at < datetime.now(timezone.utc):
        return {"valid": False, "code": code, "reason": "Voucher expired"}
    if subtotal is not None and subtotal < voucher.min_order_value:
        return {
            "valid": False,
            "code": code,
            "reason": f"Minimum order value is {voucher.min_order_value}",
            "minOrderValue": voucher.min_order_value,
        }

    discount_amount = 0
    if subtotal is not None:
        discount_amount = round(subtotal * (voucher.discount_percent / 100.0))
        if voucher.max_discount_amount > 0:
            discount_amount = min(discount_amount, voucher.max_discount_amount)

    return {
        "valid": True,
        "code": code,
        "voucher_id": voucher.id,
        "discountPercent": voucher.discount_percent,
        "minOrderValue": voucher.min_order_value,
        "maxDiscountAmount": voucher.max_discount_amount,
        "discountAmount": discount_amount,
    }
