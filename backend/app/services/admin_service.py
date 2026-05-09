import uuid
import hashlib

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.models import AISetting, Category, Order, OrderStatus, Product, StorePolicy, StoreProfile, User, UserRole, UserPermission, ThemeSetting, ThemePalette
from app.schemas.admin import AISettingsDTO, OrderDTO, OrderItemDTO, PolicyUpdateDTO, ProductDTO, PromoUpdateDTO, StoreProfileDTO, UserDTO, ThemePaletteDTO
from app.services.embeddings import embed_query


def get_theme_settings(db: Session) -> ThemeSetting:
    theme = db.get(ThemeSetting, 1)
    if not theme:
        theme = ThemeSetting(id=1)
        db.add(theme)
        db.commit()
        db.refresh(theme)
    return theme


def get_all_palettes(db: Session) -> list[ThemePalette]:
    return db.scalars(select(ThemePalette).order_by(ThemePalette.is_preset.desc(), ThemePalette.created_at.desc())).all()


def upsert_palette(db: Session, payload: ThemePaletteDTO) -> ThemePalette:
    palette_id = payload.id or str(uuid.uuid4())
    palette = db.get(ThemePalette, palette_id)
    
    if not palette:
        palette = ThemePalette(id=palette_id)
        db.add(palette)
    
    palette.name = payload.name
    palette.is_preset = payload.is_preset
    palette.light_main = payload.light_main
    palette.light_sub = payload.light_sub
    palette.light_accent = payload.light_accent
    palette.dark_main = payload.dark_main
    palette.dark_sub = payload.dark_sub
    palette.dark_accent = payload.dark_accent
    
    db.commit()
    db.refresh(palette)
    return palette


def set_active_palette(db: Session, palette_id: str) -> bool:
    setting = get_theme_settings(db)
    palette = db.get(ThemePalette, palette_id)
    if not palette:
        return False
    setting.active_palette_id = palette_id
    db.commit()
    return True


def delete_palette(db: Session, palette_id: str) -> bool:
    palette = db.get(ThemePalette, palette_id)
    if not palette or palette.is_preset:
        return False
    db.delete(palette)
    db.commit()
    return True


def get_or_create_ai_settings(db: Session) -> AISetting:
    setting = db.get(AISetting, 1)
    if not setting:
        setting = AISetting(id=1)
        db.add(setting)

    dirty = False
    import os
    if setting.google_client_id is None and os.getenv("CLIENT_ID"):
        setting.google_client_id = os.getenv("CLIENT_ID")
        dirty = True
    if setting.google_client_secret is None and os.getenv("CLIENT_SECRET"):
        setting.google_client_secret = os.getenv("CLIENT_SECRET")
        dirty = True
    if setting.database_url is None and os.getenv("DATABASE_URL"):
        setting.database_url = os.getenv("DATABASE_URL")
        dirty = True
    if setting.system_prompt is None:
        try:
            from app.services.system_prompt import BASE_SYSTEM_PROMPT
            setting.system_prompt = BASE_SYSTEM_PROMPT
            dirty = True
        except ImportError:
            pass

    # Auto-heal legacy studio branding prompt left from older datasets.
    if setting.system_prompt:
        prompt_text = setting.system_prompt.lower()
        legacy_prompt_tokens = (
            "feli studio",
            "photography packages",
            "gói chụp ảnh",
            "studio services",
        )
        if any(token in prompt_text for token in legacy_prompt_tokens):
            try:
                from app.services.system_prompt import BASE_SYSTEM_PROMPT
                setting.system_prompt = BASE_SYSTEM_PROMPT
                dirty = True
            except ImportError:
                pass

    if dirty or not setting.id:
        try:
            db.commit()
            db.refresh(setting)
        except IntegrityError:
            db.rollback()

    return setting


def update_ai_settings(db: Session, payload: AISettingsDTO) -> AISetting:
    setting = get_or_create_ai_settings(db)
    setting.chat_provider = payload.chat_provider
    setting.chat_model = payload.chat_model
    setting.embedding_provider = payload.embedding_provider
    setting.embedding_model = payload.embedding_model
    setting.google_client_id = payload.google_client_id
    setting.google_client_secret = payload.google_client_secret
    setting.database_url = payload.database_url
    setting.system_prompt = payload.system_prompt
    setting.telegram_bot_token = payload.telegram_bot_token
    setting.telegram_chat_id = payload.telegram_chat_id
    db.commit()
    db.refresh(setting)
    return setting


def get_primary_policy(db: Session) -> StorePolicy | None:
    return db.scalar(select(StorePolicy).order_by(StorePolicy.updated_at.desc()).limit(1))


def upsert_primary_policy(db: Session, payload: PolicyUpdateDTO) -> StorePolicy:
    setting = get_or_create_ai_settings(db)
    policy = get_primary_policy(db)
    if not policy:
        policy = StorePolicy(
            id=str(uuid.uuid4()),
            policy_type=payload.policy_type,
            locale=payload.locale,
            title=payload.title,
            content=payload.content,
        )
        db.add(policy)
    else:
        policy.policy_type = payload.policy_type
        policy.locale = payload.locale
        policy.title = payload.title
        policy.content = payload.content

    policy.embedding = embed_query(
        payload.content,
        provider=setting.embedding_provider,
        model=setting.embedding_model,
    )
    db.commit()
    db.refresh(policy)
    return policy


def get_all_products(db: Session, category: str = None, trending: bool = None) -> list[Product]:
    stmt = select(Product)
    if category:
        stmt = stmt.where(Product.category == category)
    if trending is not None:
        stmt = stmt.where(Product.trending == trending)
    return db.scalars(stmt.order_by(Product.created_at.desc())).all()


def upsert_product(db: Session, payload: ProductDTO) -> Product:
    product_id = payload.id or str(uuid.uuid4())
    product = db.get(Product, product_id)

    if not product:
        product = Product(id=product_id)
        db.add(product)

    product.slug = payload.slug
    product.sku = payload.slug.upper().replace("-", "_")
    product.name = payload.name
    product.brand = payload.brand
    product.tagline = payload.tagline or {"vi": "", "en": ""}
    product.category = payload.category
    
    product.price = payload.basePrice
    product.is_trade_in = payload.is_trade_in
    product.image = payload.image
    product.gallery = payload.gallery
    product.description = payload.description or {"vi": "", "en": ""}
    product.details = payload.details or {}
    product.highlight_specs = payload.highlightSpecs
    product.available = payload.available
    product.trending = payload.trending
    product.is_new = payload.isNew
    product.stock = payload.stock
    product.rating = payload.rating
    product.review_count = payload.reviewCount
    product.discount = payload.discountPercent

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: str) -> tuple[bool, str]:
    product = db.get(Product, product_id)
    if not product:
        return False, "not_found"
    try:
        db.delete(product)
        db.commit()
        return True, "deleted"
    except IntegrityError:
        db.rollback()
        return False, "in_use"


def update_product_promo(db: Session, product_id: str, payload: PromoUpdateDTO) -> Product | None:
    product = db.get(Product, product_id)
    if not product:
        return None
    if payload.trending is not None:
        product.trending = payload.trending
    if payload.discount is not None:
        product.discount = payload.discount
    db.commit()
    db.refresh(product)
    return product


def get_store_profile(db: Session) -> StoreProfile:
    profile = db.get(StoreProfile, 1)
    if not profile:
        profile = StoreProfile(id=1)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_store_profile(db: Session, payload: StoreProfileDTO) -> StoreProfile:
    profile = get_store_profile(db)
    profile.name = payload.name
    profile.address = payload.address
    profile.email = payload.email
    profile.bank_name = payload.bank_name
    profile.bank_account = payload.bank_account
    profile.bank_beneficiary = payload.bank_beneficiary
    profile.facebook_link = payload.facebook_link
    profile.instagram_link = payload.instagram_link
    db.commit()
    db.refresh(profile)
    return profile


def get_all_orders(db: Session) -> list[Order]:
    return db.scalars(select(Order).order_by(Order.created_at.desc())).all()


def update_order_status(db: Session, order_id: str, status: str) -> Order | None:
    order = db.get(Order, order_id)
    if not order:
        return None

    normalized = status.strip().upper().replace(" ", "_")
    order.status = OrderStatus(normalized)
    db.commit()
    db.refresh(order)
    return order


def get_all_users(db: Session) -> list[User]:
    return db.scalars(select(User).order_by(User.created_at.desc())).all()


def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def upsert_user(db: Session, payload: UserDTO) -> User:
    user_id = payload.id or str(uuid.uuid4())
    user = db.get(User, user_id)
    
    username = payload.username or payload.email

    if not user:
        user = User(id=user_id, email=payload.email, username=username)
        db.add(user)

    user.email = payload.email
    user.username = username
    user.full_name = payload.full_name
    user.role = payload.role
    user.permission = payload.permission
    
    if payload.password:
        user.hashed_password = get_password_hash(payload.password)

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: str) -> tuple[bool, str]:
    user = db.get(User, user_id)
    if not user:
        return False, "not_found"
    try:
        db.delete(user)
        db.commit()
        return True, "deleted"
    except IntegrityError:
        db.rollback()
        return False, "in_use"

