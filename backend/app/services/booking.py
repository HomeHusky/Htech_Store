import uuid
from datetime import datetime
from math import floor

from sqlalchemy.orm import Session

from app.models.models import Order, OrderItem, OrderStatus
from app.schemas.dto import BookingItemDTO, BookingSummaryDTO, CustomerInfoDTO


def _new_order_number() -> str:
    return f"ML-{floor(2400 + (datetime.utcnow().timestamp() % 1000))}"


def manage_booking(db: Session, customer_info: CustomerInfoDTO, items: list[BookingItemDTO]) -> BookingSummaryDTO:
    from app.models.models import StoreSetting
    setting = db.query(StoreSetting).filter_by(id="default").first()
    dep_pct = (setting.deposit_percentage / 100.0) if setting else 0.20
    
    subtotal = sum(item.price * item.qty for item in items)
    deposit = round(subtotal * dep_pct)
    order_id = str(uuid.uuid4())
    order = Order(
        id=order_id,
        order_number=_new_order_number(),
        customer=customer_info.name,
        email=customer_info.email,
        phone=customer_info.phone,
        total=subtotal,
        deposit=deposit,
        status=OrderStatus.AWAITING_DEPOSIT,
        expected_delivery=customer_info.expectedDelivery,
        notes=customer_info.note,
    )
    order.items = [
        OrderItem(
            id=str(uuid.uuid4()),
            product_id=item.productId,
            qty=item.qty,
            price=item.price,
            # days removed for sales logic
        )
        for item in items
    ]
    db.add(order)
    db.commit()
    return BookingSummaryDTO(
        orderId=order.order_number,
        items=items,
        subtotal=subtotal,
        deposit=deposit,
        remaining=subtotal - deposit,
        status="Awaiting Deposit",
        expectedDelivery=customer_info.expectedDelivery,
        paymentLinkOrQr=f"https://img.vietqr.io/image/970436-0123456789-compact2.png?amount={deposit}",
    )
