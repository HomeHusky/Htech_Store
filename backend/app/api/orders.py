from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.models import Order, OrderStatus, OrderItem, Product, StoreSetting
import uuid
import datetime
from app.services.vouchers import verify_voucher

router = APIRouter(prefix="/api/orders", tags=["orders"])

class OrderItemPayload(BaseModel):
    product_id: str
    variant_id: str | None = None
    qty: int
    price: int
    days: int | None = None

class CreateOrderPayload(BaseModel):
    customer: str
    email: str
    phone: str
    total: int | None = None
    deposit: int | None = None
    event_date: str
    notes: str | None = None
    items: list[OrderItemPayload]
    voucher_code: str | None = None

@router.post("")
def create_order(payload: CreateOrderPayload, db: Session = Depends(get_db)):
    # Server-side compute subtotal, apply voucher, compute deposit, validate stock
    subtotal = 0
    products_to_update = []
    for it in payload.items:
        p = db.get(Product, it.product_id)
        if not p:
            raise HTTPException(404, f"Product not found: {it.product_id}")
        # check variants
        variant = None
        # fetch variant if provided
        if getattr(it, "variant_id", None):
            # lazy import to avoid cycles
            from app.models.models import ProductVariant

            variant = db.get(ProductVariant, it.variant_id)
            if not variant:
                raise HTTPException(404, f"Variant not found: {it.variant_id}")
            if variant.product_id != p.id:
                raise HTTPException(400, "Variant does not belong to product")
            if variant.stock < it.qty:
                raise HTTPException(400, f"Insufficient stock for variant {variant.id}")
            line_price = variant.price
        else:
            # if product has variants, require variant_id
            from app.models.models import ProductVariant
            has_variant = db.query(ProductVariant).filter(ProductVariant.product_id == p.id).first() is not None
            if has_variant:
                raise HTTPException(400, f"Product {p.id} has variants; variant_id is required")
            if p.stock < it.qty:
                raise HTTPException(400, f"Insufficient stock for {p.id}")
            line_price = p.price
        line = line_price * it.qty * (it.days or 1)
        subtotal += line
        products_to_update.append((p, it.qty, variant))

    # apply voucher if provided
    discount_amount = 0
    voucher_id = None
    if payload.voucher_code:
        v = verify_voucher(db, payload.voucher_code, subtotal)
        if not v.get("valid"):
            raise HTTPException(400, f"Voucher invalid: {v.get('reason')}" )
        voucher_id = v.get("voucher_id")
        discount_amount = v.get("discountAmount", 0)

    total = subtotal - discount_amount

    # deposit from store settings
    setting = db.query(StoreSetting).filter_by(id="default").first()
    dep_pct = (setting.deposit_percentage / 100.0) if setting else 0.20
    deposit = round(total * dep_pct)

    # create order
    count = db.query(Order).count()
    order_number = f"ML-{2400 + count}"

    o = Order(
        id=str(uuid.uuid4()),
        order_number=order_number,
        customer=payload.customer,
        email=payload.email,
        phone=payload.phone,
        voucher_id=voucher_id,
        total=total,
        discount_amount=discount_amount,
        deposit=deposit,
        event_date=datetime.date.fromisoformat(payload.event_date.split("T")[0]),
        notes=payload.notes,
        status=OrderStatus.AWAITING_DEPOSIT
    )
    db.add(o)
    for item in payload.items:
        product = db.get(Product, item.product_id)
        oi_kwargs = dict(
            id=str(uuid.uuid4()),
            order_id=o.id,
            product_id=item.product_id,
            qty=item.qty,
            price=item.price,
            days=item.days,
            warranty_expiry=(datetime.date.fromisoformat(payload.event_date.split("T")[0]) + datetime.timedelta(days=90 if product and product.category == "repair" else 365))
        )
        if getattr(item, "variant_id", None):
            oi_kwargs["variant_id"] = item.variant_id
        oi = OrderItem(**oi_kwargs)
        db.add(oi)

    # decrement stock
    # decrement stock for product or variant
    for p, qty, variant in products_to_update:
        if variant:
            variant.stock = variant.stock - qty
            db.add(variant)
        else:
            p.stock = p.stock - qty
            db.add(p)

    db.commit()
    return {"id": o.id, "order_number": o.order_number, "total": total, "deposit": deposit}

class ProofPayload(BaseModel):
    proof: str

@router.patch("/{order_id}/proof")
def upload_proof(order_id: str, payload: ProofPayload, db: Session = Depends(get_db)):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(404, "Order not found")
    o.payment_proof = payload.proof
    o.status = OrderStatus.PAID
    db.commit()
    return {"success": True, "status": o.status.value}
