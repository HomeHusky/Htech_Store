import uuid
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import (
    Category,
    ChatHistory,
    ChatSession,
    FAQ,
    Order,
    OrderItem,
    OrderStatus,
    Product,
    ProductAttribute,
    ProductReview,
    ProductVariant,
    Voucher,
    StoreProfile,
)
from app.services.product_utils import sync_product_min_price


CATEGORY_ROWS = [
    {"id": "laptop", "slug": "laptop", "name": {"vi": "Laptop & MacBook", "en": "Laptops & MacBook"}},
    {"id": "laptop-gaming", "slug": "laptop-gaming", "name": {"vi": "Laptop Gaming", "en": "Gaming Laptops"}, "parent_id": "laptop"},
    {"id": "laptop-office", "slug": "laptop-office", "name": {"vi": "Laptop Văn Phòng", "en": "Office Laptops"}, "parent_id": "laptop"},
    {"id": "phone", "slug": "phone", "name": {"vi": "Điện thoại", "en": "Smartphones"}},
    {"id": "pc", "slug": "pc", "name": {"vi": "Máy tính để bàn", "en": "Desktop PCs"}},
    {"id": "pc-gaming", "slug": "pc-gaming", "name": {"vi": "PC Gaming", "en": "Gaming PCs"}, "parent_id": "pc"},
    {"id": "component", "slug": "component", "name": {"vi": "Linh kiện PC", "en": "PC Components"}, "parent_id": "pc"},
    {"id": "accessory", "slug": "accessory", "name": {"vi": "Phụ kiện công nghệ", "en": "Accessories"}},
    {"id": "repair", "slug": "repair", "name": {"vi": "Dịch vụ sửa chữa", "en": "Repair Services"}},
]

FAQ_ROWS = [
    ("shipping_time", "Giao hàng mất bao lâu?", "Nội thành TP.HCM giao nhanh 2 giờ, các tỉnh thành khác từ 2 đến 3 ngày làm việc."),
    ("payment_methods", "Có những phương thức thanh toán nào?", "Htech hỗ trợ COD, chuyển khoản ngân hàng, và thanh toán qua các cổng phổ biến theo từng đơn hàng."),
    ("warranty", "Sản phẩm được bảo hành bao lâu?", "Laptop và PC thường bảo hành 12 đến 36 tháng tùy cấu hình. Phụ kiện và dịch vụ có thời hạn riêng."),
    ("custom_build", "Có nhận build PC theo yêu cầu không?", "Có. Htech hỗ trợ tư vấn, build PC theo nhu cầu gaming, đồ họa, văn phòng hoặc stream."),
    ("repair_service", "Sửa chữa có lấy ngay được không?", "Các lỗi đơn giản có thể xử lý trong ngày, còn kiểm tra phần cứng sâu sẽ cần thêm thời gian xác minh."),
    ("chatbot", "Chatbot có thể hỗ trợ gì?", "Chatbot hỗ trợ tư vấn cấu hình, tra cứu chính sách, trạng thái đơn hàng và hướng dẫn thanh toán."),
]


def _upsert_category(db: Session, payload: dict) -> None:
    category = db.get(Category, payload["id"])
    if not category:
        category = Category(id=payload["id"], slug=payload["slug"], name=payload["name"])
        db.add(category)
    category.slug = payload["slug"]
    category.name = payload["name"]
    category.parent_id = payload.get("parent_id")


def _flatten_product_specs(product: Product) -> list[tuple[str, str, str]]:
    rows: list[tuple[str, str, str]] = []
    details = product.details or {}
    source = details
    if isinstance(details, dict):
        preferred = details.get("vi") if isinstance(details.get("vi"), dict) else None
        if preferred:
            source = preferred
    if isinstance(source, dict):
        for key, value in source.items():
            rows.append((str(key), str(key).replace("_", " ").title(), str(value)))
    for index, spec in enumerate(product.highlight_specs or [], start=1):
        rows.append((f"highlight_{index}", "Highlight", str(spec)))
    return rows


def _upsert_product_attribute(db: Session, product: Product, attr_key: str, attr_label: str, attr_value: str, sort_order: int) -> None:
    attr_id = f"{product.id}:{attr_key}"
    attribute = db.get(ProductAttribute, attr_id)
    if not attribute:
        attribute = ProductAttribute(
            id=attr_id,
            product_id=product.id,
            attr_key=attr_key,
            attr_label=attr_label,
            attr_value=attr_value,
            sort_order=sort_order,
        )
        db.add(attribute)
    attribute.product_id = product.id
    attribute.attr_key = attr_key
    attribute.attr_label = attr_label
    attribute.attr_value = attr_value
    attribute.unit = None
    attribute.sort_order = sort_order


def _upsert_review(db: Session, product: Product, review_index: int, rating: int, comment: str) -> None:
    review_id = f"{product.id}:review:{review_index}"
    review = db.get(ProductReview, review_id)
    if not review:
        review = ProductReview(
            id=review_id,
            product_id=product.id,
            rating=rating,
            comment=comment,
            images=[],
            locale="vi",
        )
        db.add(review)
    review.product_id = product.id
    review.rating = rating
    review.comment = comment
    review.images = []
    review.locale = "vi"


def _upsert_variant(db: Session, product: Product, variant_index: int, variant_name: str, attributes: dict, price: int, stock: int, is_default: bool) -> None:
    variant_id = f"{product.id}:variant:{variant_index}"
    variant_sku = product.sku or f"{product.slug.upper().replace('-', '_')}-{variant_index}"
    variant = db.get(ProductVariant, variant_id)
    if not variant:
        variant = ProductVariant(
            id=variant_id,
            product_id=product.id,
            sku=variant_sku,
            name=variant_name,
            attributes=attributes,
            price=price,
            stock=stock,
            is_default=is_default,
            sort_order=variant_index,
        )
        db.add(variant)
    variant.product_id = product.id
    variant.sku = variant_sku
    variant.name = variant_name
    variant.attributes = attributes
    variant.price = price
    variant.stock = stock
    variant.is_default = is_default
    variant.sort_order = variant_index
    # keep product.price in sync with the minimum variant price
    try:
        sync_product_min_price(db, product.id)
    except Exception:
        pass


def _ensure_product_attributes_and_reviews(db: Session) -> None:
    products = db.scalars(select(Product).order_by(Product.created_at.asc())).all()
    for product in products:
        _upsert_variant(
            db,
            product,
            1,
            f"{product.name.get('vi') if isinstance(product.name, dict) else product.slug} - Default",
            {"slug": product.slug, "brand": product.brand, "category": product.category},
            product.price,
            product.stock,
            True,
        )
        for index, (attr_key, attr_label, attr_value) in enumerate(_flatten_product_specs(product), start=1):
            _upsert_product_attribute(db, product, attr_key, attr_label, attr_value, index)

        review_count = product.review_count or 0
        comment_prefix = product.name.get("vi") if isinstance(product.name, dict) else product.slug
        _upsert_review(db, product, 1, 5 if review_count >= 5 else 4, f"{comment_prefix} có trải nghiệm dùng thực tế tốt, đúng mô tả và tư vấn rõ ràng.")
        _upsert_review(db, product, 2, 5 if review_count >= 20 else 4, f"Sản phẩm {comment_prefix} vận hành ổn định, phù hợp nhu cầu công việc và giải trí.")


def _ensure_faqs(db: Session) -> None:
    for sort_order, (faq_id, question, answer) in enumerate(FAQ_ROWS, start=1):
        faq = db.get(FAQ, faq_id)
        if not faq:
            faq = FAQ(id=faq_id, locale="vi", question=question, answer=answer, sort_order=sort_order, active=True)
            db.add(faq)
        faq.locale = "vi"
        faq.question = question
        faq.answer = answer
        faq.sort_order = sort_order
        faq.active = True


def _ensure_chat_history(db: Session) -> None:
    session = db.get(ChatSession, "demo-chat-session")
    if not session:
        session = ChatSession(
            id="demo-chat-session",
            locale="vi",
            session_meta={"source": "seed", "goal": "ai-sales-assistant"},
        )
        db.add(session)
    session.locale = "vi"
    session.session_meta = {"source": "seed", "goal": "ai-sales-assistant"}
    db.flush()

    demo_messages = [
        ("user", "Mình cần một laptop gaming tầm trung, ưu tiên màn hình đẹp và tản nhiệt tốt."),
        ("assistant", "Bạn có thể cân nhắc các mẫu RTX 4060 hoặc 4070, ưu tiên RAM 16GB và màn 144Hz trở lên."),
        ("user", "Máy có được bảo hành không?"),
        ("assistant", "Htech có chính sách bảo hành theo sản phẩm, thường từ 12 đến 36 tháng với laptop và PC."),
    ]
    for index, (role, message) in enumerate(demo_messages, start=1):
        message_id = f"demo-chat-session:{index}"
        history = db.get(ChatHistory, message_id)
        if not history:
            history = ChatHistory(
                id=message_id,
                session_id=session.id,
                role=role,
                message=message,
                metadata_={"source": "seed"},
            )
            db.add(history)
        history.session_id = session.id
        history.role = role
        history.message = message
        history.metadata_ = {"source": "seed", "tool": "context"} if role == "assistant" else {"source": "seed"}


def _ensure_order_backfill(db: Session) -> None:
    profile = db.get(StoreProfile, 1) or db.query(StoreProfile).first()
    fallback_address = profile.address if profile else "123 Tech Street, Hanoi"
    products = {product.id: product for product in db.scalars(select(Product)).all()}

    orders = db.scalars(select(Order)).all()
    for order in orders:
        if not order.shipping_address:
            order.shipping_address = fallback_address

        if order.status in {OrderStatus.PAID, OrderStatus.COMPLETED}:
            order.payment_status = "PAID"
            order.payment_method = "BANK_TRANSFER"
        elif order.status == OrderStatus.SERVICE_ONGOING:
            order.payment_status = "PROCESSING"
            order.payment_method = "COD"
        elif order.status == OrderStatus.CANCELLED:
            order.payment_status = "CANCELLED"
            order.payment_method = "COD"
        else:
            order.payment_status = "PENDING"
            order.payment_method = "COD"

    for item in db.scalars(select(OrderItem)).all():
        order = item.order
        product = products.get(item.product_id)
        if not order or not product:
            continue

        warranty_days = 90 if product.category == "repair" else 365
        if item.warranty_expiry is None:
            item.warranty_expiry = order.event_date + timedelta(days=warranty_days)


def _ensure_vouchers(db: Session) -> None:
    voucher_rows = [
        {
            "id": "voucher-welcome10",
            "code": "WELCOME10",
            "discount_percent": 10,
            "active": True,
            "min_order_value": 1000000,
            "max_discount_amount": 300000,
        },
        {
            "id": "voucher-buildpc15",
            "code": "BUILDPC15",
            "discount_percent": 15,
            "active": True,
            "min_order_value": 20000000,
            "max_discount_amount": 2500000,
        },
    ]
    for payload in voucher_rows:
        voucher = db.get(Voucher, payload["id"])
        if not voucher:
            voucher = Voucher(id=payload["id"], code=payload["code"], discount_percent=payload["discount_percent"], active=payload["active"])
            db.add(voucher)
        voucher.code = payload["code"]
        voucher.discount_percent = payload["discount_percent"]
        voucher.active = payload["active"]
        voucher.min_order_value = payload["min_order_value"]
        voucher.max_discount_amount = payload["max_discount_amount"]


def seed_support_data(db: Session) -> None:
    for payload in CATEGORY_ROWS:
        _upsert_category(db, payload)

    _ensure_product_attributes_and_reviews(db)
    _ensure_faqs(db)
    _ensure_chat_history(db)
    _ensure_order_backfill(db)
    _ensure_vouchers(db)
    db.commit()
