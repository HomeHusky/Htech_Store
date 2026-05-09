import enum
from datetime import date, datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, Boolean, Date, DateTime, Enum, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import settings
from app.db.base import Base


class StoreSetting(Base):
    __tablename__ = "store_settings"
    id: Mapped[str] = mapped_column(String, primary_key=True, default="default")
    deposit_percentage: Mapped[float] = mapped_column(Integer, default=20) # Use integer for simpler % handling
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    name: Mapped[dict] = mapped_column(JSON, nullable=False)
    parent_id: Mapped[str | None] = mapped_column(ForeignKey("categories.id"), nullable=True, index=True)

    products: Mapped[list["Product"]] = relationship(back_populates="category_ref")


class OrderStatus(str, enum.Enum):
    AWAITING_DEPOSIT = "AWAITING_DEPOSIT"
    PAID = "PAID"
    SERVICE_ONGOING = "SERVICE_ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class UserRole(str, enum.Enum):
    USER = "USER"
    STAFF = "STAFF"
    ADMIN = "ADMIN"


class UserPermission(str, enum.Enum):
    NONE = "NONE"
    READ_ONLY = "READ_ONLY"
    FULL = "FULL"

class RepairStatus(str, enum.Enum):
    RECEIVED = "received"
    TESTING = "testing"
    FIXING = "fixing"
    READY = "ready"
    DELIVERED = "delivered"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String, nullable=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), default=UserRole.USER, nullable=False)
    permission: Mapped[UserPermission] = mapped_column(Enum(UserPermission, name="user_permission"), default=UserPermission.NONE, nullable=False)
    google_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    orders: Mapped[list["Order"]] = relationship(back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    sku: Mapped[str | None] = mapped_column(String, unique=True, nullable=True, index=True)
    name: Mapped[dict] = mapped_column(JSON, nullable=False)
    brand: Mapped[str] = mapped_column(String, nullable=False, default="Htech")
    tagline: Mapped[dict] = mapped_column(JSON, nullable=True)
    category: Mapped[str] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)
    category_ref: Mapped["Category"] = relationship(back_populates="products")
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    is_trade_in: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    image: Mapped[str] = mapped_column(String, nullable=False)
    gallery: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    description: Mapped[dict] = mapped_column(JSON, nullable=False)
    details: Mapped[dict] = mapped_column(JSON, nullable=False)
    highlight_specs: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    trending: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_new: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    rating: Mapped[float] = mapped_column(Integer, nullable=False, default=5) # Stored as float/int
    review_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    discount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    embedding: Mapped[list[float] | None] = mapped_column(Vector(settings.embedding_dimension), nullable=True)
    search_vector: Mapped[str | None] = mapped_column(TSVECTOR, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    sku: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    attributes: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    order_number: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    customer: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    shipping_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    voucher_id: Mapped[str | None] = mapped_column(ForeignKey("vouchers.id"), nullable=True, index=True)
    total: Mapped[int] = mapped_column(Integer, nullable=False)
    deposit: Mapped[int] = mapped_column(Integer, nullable=False)
    discount_amount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    payment_method: Mapped[str] = mapped_column(String, nullable=False, default="COD")
    payment_status: Mapped[str] = mapped_column(String, nullable=False, default="PENDING")
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status"), default=OrderStatus.AWAITING_DEPOSIT, nullable=False, index=True
    )
    expected_delivery: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment_proof: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    variant_id: Mapped[str | None] = mapped_column(ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True, index=True)
    qty: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    # Days field removed as it was for rentals
    warranty_expiry: Mapped[date | None] = mapped_column(Date, nullable=True)

    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="order_items")


class ProductAttribute(Base):
    __tablename__ = "product_attributes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    attr_key: Mapped[str] = mapped_column(String, nullable=False, index=True)
    attr_label: Mapped[str] = mapped_column(String, nullable=False)
    attr_value: Mapped[str] = mapped_column(Text, nullable=False)
    unit: Mapped[str | None] = mapped_column(String, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ProductReview(Base):
    __tablename__ = "product_reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    images: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    locale: Mapped[str] = mapped_column(String, nullable=False, default="vi")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class FAQ(Base):
    __tablename__ = "faqs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    locale: Mapped[str] = mapped_column(String, nullable=False, default="vi", index=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    locale: Mapped[str] = mapped_column(String, nullable=False, default="vi")
    session_meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ChatHistory(Base):
    __tablename__ = "chat_history"
    __table_args__ = (
        Index("ix_chat_history_session_created_at", "session_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("chat_sessions.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    role: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Voucher(Base):
    __tablename__ = "vouchers"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    discount_percent: Mapped[int] = mapped_column(Integer, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    min_order_value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_discount_amount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class PromotionType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    FREE_SHIPPING = "freeShipping"
    BUY_X_GET_Y = "buyXgetY"


class PromotionStatus(str, enum.Enum):
    ACTIVE = "active"
    SCHEDULED = "scheduled"
    EXPIRED = "expired"
    DISABLED = "disabled"


class Promotion(Base):
    __tablename__ = "promotions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[PromotionType] = mapped_column(Enum(PromotionType, name="promotion_type"), nullable=False)
    value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    min_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_discount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    usage_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    used_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[PromotionStatus] = mapped_column(Enum(PromotionStatus, name="promotion_status"), default=PromotionStatus.ACTIVE)
    applicable_products: Mapped[str] = mapped_column(String, default="all") # all, category, specific
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class StorePolicy(Base):
    __tablename__ = "store_policies"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    policy_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    locale: Mapped[str] = mapped_column(String, nullable=False, default="vi", index=True)
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(settings.embedding_dimension), nullable=True)
    search_vector: Mapped[str | None] = mapped_column(TSVECTOR, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class AISetting(Base):
    __tablename__ = "ai_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    chat_provider: Mapped[str] = mapped_column(String, nullable=False, default="gemini")
    chat_model: Mapped[str] = mapped_column(String, nullable=False, default="gemini-2.0-flash")
    embedding_provider: Mapped[str] = mapped_column(String, nullable=False, default="gemini")
    embedding_model: Mapped[str] = mapped_column(String, nullable=False, default="gemini-embedding-001")
    google_client_id: Mapped[str | None] = mapped_column(String, nullable=True)
    google_client_secret: Mapped[str | None] = mapped_column(String, nullable=True)
    database_url: Mapped[str | None] = mapped_column(String, nullable=True)
    system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    telegram_bot_token: Mapped[str | None] = mapped_column(String, nullable=True)
    telegram_chat_id: Mapped[str | None] = mapped_column(String, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class StoreProfile(Base):
    __tablename__ = "store_profile"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    name: Mapped[str] = mapped_column(String, nullable=False, default="Htech")
    address: Mapped[str] = mapped_column(String, nullable=False, default="23 Đồng Khởi, District 1, Saigon")
    email: Mapped[str] = mapped_column(String, nullable=False, default="hello@htechstore.vn")
    bank_name: Mapped[str] = mapped_column(String, nullable=False, default="Vietcombank")
    bank_account: Mapped[str] = mapped_column(String, nullable=False, default="0123 456 789")
    bank_beneficiary: Mapped[str] = mapped_column(String, nullable=False, default="Htech")
    facebook_link: Mapped[str | None] = mapped_column(String, nullable=True)
    instagram_link: Mapped[str | None] = mapped_column(String, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Repair(Base):
    __tablename__ = "repairs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    customer_name: Mapped[str] = mapped_column(String, nullable=False)
    device_name: Mapped[str] = mapped_column(String, nullable=False)
    issue: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[RepairStatus] = mapped_column(Enum(RepairStatus, name="repair_status"), default=RepairStatus.RECEIVED, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    notes: Mapped[list["RepairNote"]] = relationship(back_populates="repair", cascade="all, delete-orphan")


class RepairNote(Base):
    __tablename__ = "repair_notes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    repair_id: Mapped[str] = mapped_column(ForeignKey("repairs.id", ondelete="CASCADE"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    repair: Mapped["Repair"] = relationship(back_populates="notes")


class ThemePalette(Base):
    __tablename__ = "theme_palettes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    is_preset: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Light Mode Colors
    light_main: Mapped[str] = mapped_column(String, default="#FFFFFF")
    light_sub: Mapped[str] = mapped_column(String, default="#2C3E50")
    light_accent: Mapped[str] = mapped_column(String, default="#007AFF")
    
    # Dark Mode Colors
    dark_main: Mapped[str] = mapped_column(String, default="#121212")
    dark_sub: Mapped[str] = mapped_column(String, default="#1E293B")
    dark_accent: Mapped[str] = mapped_column(String, default="#3B82F6")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ThemeSetting(Base):
    __tablename__ = "theme_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    active_palette_id: Mapped[str | None] = mapped_column(String, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
