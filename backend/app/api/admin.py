from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from pathlib import Path
import os
import shutil
import uuid
from typing import List

from app.db.session import get_db
from app.models.models import (
    Order, Repair, RepairNote, RepairStatus, StoreSetting, 
    Category, Product, User, OrderItem, Promotion, PromotionStatus, PromotionType
)
from app.schemas.admin import (
    AISettingsDTO, ModelCatalogResponse, ModelTestRequestDTO,
    ModelTestResponseDTO, PolicyResponseDTO, PolicyUpdateDTO,
    ProductDTO, PromoUpdateDTO, StoreProfileDTO, OrderDTO,
    OrderItemDTO, OrderStatusUpdateDTO, UserDTO, LoginRequestDTO,
    CategoryDTO, RepairDTO, RepairNoteDTO, ThemePaletteDTO, 
    ThemeSettingsResponseDTO, StoreSettingsDTO, TelegramTestDTO,
    PromotionDTO, PromotionCreateDTO
)
from app.services.admin_service import (
    delete_product, get_all_orders, get_all_products,
    get_or_create_ai_settings, get_primary_policy, get_store_profile,
    update_ai_settings, update_product_promo, update_store_profile,
    upsert_primary_policy, upsert_product, update_order_status,
    get_all_users, upsert_user, delete_user, get_theme_settings,
    get_all_palettes, upsert_palette, set_active_palette, delete_palette
)
from app.services.model_catalog import get_model_catalog
from app.services.chat_models import test_admin_configured_model
from app.services.telegram import notify_human_support

router = APIRouter(prefix="/api/admin", tags=["admin"])

UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total)).scalar() or 0
    active_repairs = db.query(Repair).filter(Repair.status != RepairStatus.DELIVERED).count()
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "active_repairs": active_repairs,
        "recent_activity": [] # Simplified for now
    }


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / f"{uuid.uuid4()}_{file.filename}"
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/static/uploads/{file_path.name}"}

@router.get("/categories", response_model=List[CategoryDTO])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return [CategoryDTO(id=c.id, slug=c.slug, name=c.name) for c in categories]

@router.post("/categories", response_model=CategoryDTO)
def create_category(payload: CategoryDTO, db: Session = Depends(get_db)):
    c = Category(id=payload.id, slug=payload.slug, name=payload.name)
    db.add(c)
    db.commit()
    return payload

@router.put("/categories/{category_id}", response_model=CategoryDTO)
def update_category(category_id: str, payload: CategoryDTO, db: Session = Depends(get_db)):
    c = db.get(Category, category_id)
    if not c: raise HTTPException(404, "Category not found")
    c.slug = payload.slug
    c.name = payload.name
    db.commit()
    return payload

@router.delete("/categories/{category_id}")
def remove_category(category_id: str, db: Session = Depends(get_db)):
    c = db.get(Category, category_id)
    if not c: raise HTTPException(404, "Category not found")
    try:
        db.delete(c)
        db.commit()
        return {"success": True}
    except Exception:
        raise HTTPException(409, "Cannot delete category in use")

@router.get("/products", response_model=List[ProductDTO])
def list_products(db: Session = Depends(get_db)):
    products = get_all_products(db)
    return [
        ProductDTO(
            id=p.id, slug=p.slug, name=p.name, brand=p.brand, category=p.category,
            tagline=p.tagline or {"vi": "", "en": ""}, basePrice=p.price, is_trade_in=p.is_trade_in, 
            image=p.image, gallery=p.gallery, description=p.description, 
            details=p.details, highlightSpecs=p.highlight_specs,
            available=p.available, trending=p.trending, isNew=p.is_new,
            stock=p.stock, rating=p.rating, reviewCount=p.review_count,
            discountPercent=p.discount,
        ) for p in products
    ]

@router.post("/products", response_model=ProductDTO)
def create_product(payload: ProductDTO, db: Session = Depends(get_db)):
    p = upsert_product(db, payload)
    return ProductDTO(
        id=p.id, slug=p.slug, name=p.name, brand=p.brand, category=p.category,
        tagline=p.tagline or {"vi": "", "en": ""}, basePrice=p.price, is_trade_in=p.is_trade_in, 
        image=p.image, gallery=p.gallery, description=p.description, 
        details=p.details, highlightSpecs=p.highlight_specs,
        available=p.available, trending=p.trending, isNew=p.is_new,
        stock=p.stock, rating=p.rating, reviewCount=p.review_count,
        discountPercent=p.discount,
    )

@router.put("/products/{product_id}", response_model=ProductDTO)
def update_product(product_id: str, payload: ProductDTO, db: Session = Depends(get_db)):
    payload.id = product_id
    p = upsert_product(db, payload)
    return ProductDTO(
        id=p.id, slug=p.slug, name=p.name, brand=p.brand, category=p.category,
        tagline=p.tagline or {"vi": "", "en": ""}, basePrice=p.price, is_trade_in=p.is_trade_in,
        image=p.image, gallery=p.gallery, description=p.description,
        details=p.details, highlightSpecs=p.highlight_specs,
        available=p.available, trending=p.trending, isNew=p.is_new,
        stock=p.stock, rating=p.rating, reviewCount=p.review_count,
        discountPercent=p.discount,
    )

@router.delete("/products/{product_id}")
def remove_product(product_id: str, db: Session = Depends(get_db)):
    success, reason = delete_product(db, product_id)
    if success: return {"success": True}
    if reason == "not_found": raise HTTPException(404, "Product not found")
    if reason == "in_use": raise HTTPException(409, "Product in use")
    raise HTTPException(500, "Failed to delete")

@router.patch("/products/{product_id}/promo", response_model=ProductDTO)
def update_promo(product_id: str, payload: PromoUpdateDTO, db: Session = Depends(get_db)):
    p = update_product_promo(db, product_id, payload)
    return ProductDTO(
        id=p.id, slug=p.slug, name=p.name, brand=p.brand, category=p.category,
        tagline=p.tagline or {"vi": "", "en": ""}, basePrice=p.price, is_trade_in=p.is_trade_in, 
        image=p.image, gallery=p.gallery, description=p.description, 
        details=p.details, highlightSpecs=p.highlight_specs,
        available=p.available, trending=p.trending, isNew=p.is_new,
        stock=p.stock, rating=p.rating, reviewCount=p.review_count,
        discountPercent=p.discount,
    )


def _promotion_dto(p: Promotion) -> PromotionDTO:
    return PromotionDTO(
        id=p.id,
        code=p.code,
        name=p.name,
        type=p.type.value,
        value=p.value,
        min_order=p.min_order,
        max_discount=p.max_discount,
        usage_limit=p.usage_limit,
        used_count=p.used_count,
        start_date=p.start_date.isoformat(),
        end_date=p.end_date.isoformat(),
        status=p.status.value,
        applicable_products=p.applicable_products,
        category=p.category,
    )


def _apply_promotion_payload(p: Promotion, payload: PromotionCreateDTO | PromotionDTO) -> Promotion:
    from datetime import date

    p.code = payload.code.upper().strip()
    p.name = payload.name
    p.type = PromotionType(payload.type)
    p.value = payload.value
    p.min_order = payload.min_order
    p.max_discount = payload.max_discount
    p.usage_limit = payload.usage_limit
    p.start_date = date.fromisoformat(payload.start_date)
    p.end_date = date.fromisoformat(payload.end_date)
    p.applicable_products = payload.applicable_products
    p.category = payload.category
    if hasattr(payload, "status"):
        p.status = PromotionStatus(payload.status)
    return p


@router.get("/promotions", response_model=List[PromotionDTO])
def list_promotions(db: Session = Depends(get_db)):
    promotions = db.query(Promotion).order_by(Promotion.created_at.desc()).all()
    return [_promotion_dto(p) for p in promotions]


@router.post("/promotions", response_model=PromotionDTO)
def create_promotion(payload: PromotionCreateDTO, db: Session = Depends(get_db)):
    p = _apply_promotion_payload(Promotion(), payload)
    db.add(p)
    db.commit()
    db.refresh(p)
    return _promotion_dto(p)


@router.put("/promotions/{promotion_id}", response_model=PromotionDTO)
def update_promotion(promotion_id: int, payload: PromotionDTO, db: Session = Depends(get_db)):
    p = db.get(Promotion, promotion_id)
    if not p:
        raise HTTPException(404, "Promotion not found")
    _apply_promotion_payload(p, payload)
    db.commit()
    db.refresh(p)
    return _promotion_dto(p)


@router.delete("/promotions/{promotion_id}")
def remove_promotion(promotion_id: int, db: Session = Depends(get_db)):
    p = db.get(Promotion, promotion_id)
    if not p:
        raise HTTPException(404, "Promotion not found")
    db.delete(p)
    db.commit()
    return {"success": True}

@router.get("/model-catalog", response_model=ModelCatalogResponse)
async def model_catalog():
    chat_providers, embedding_providers = await get_model_catalog()
    return ModelCatalogResponse(chat_providers=chat_providers, embedding_providers=embedding_providers)

@router.get("/settings", response_model=AISettingsDTO)
def get_settings(db: Session = Depends(get_db)):
    setting = get_or_create_ai_settings(db)
    return AISettingsDTO(
        chat_provider=setting.chat_provider, chat_model=setting.chat_model,
        embedding_provider=setting.embedding_provider, embedding_model=setting.embedding_model,
        google_client_id=setting.google_client_id, google_client_secret=setting.google_client_secret,
        database_url=setting.database_url, system_prompt=setting.system_prompt,
        telegram_bot_token=setting.telegram_bot_token, telegram_chat_id=setting.telegram_chat_id,
    )

@router.put("/settings", response_model=AISettingsDTO)
def put_settings(payload: AISettingsDTO, db: Session = Depends(get_db)):
    setting = update_ai_settings(db, payload)
    return AISettingsDTO(
        chat_provider=setting.chat_provider, chat_model=setting.chat_model,
        embedding_provider=setting.embedding_provider, embedding_model=setting.embedding_model,
        google_client_id=setting.google_client_id, google_client_secret=setting.google_client_secret,
        database_url=setting.database_url, system_prompt=setting.system_prompt,
        telegram_bot_token=setting.telegram_bot_token, telegram_chat_id=setting.telegram_chat_id,
    )

@router.get("/policy", response_model=PolicyResponseDTO | None)
def get_policy(db: Session = Depends(get_db)):
    policy = get_primary_policy(db)
    if not policy: return None
    return PolicyResponseDTO(
        id=policy.id, title=policy.title, content=policy.content,
        locale=policy.locale, policy_type=policy.policy_type,
    )

@router.put("/policy", response_model=PolicyResponseDTO)
def put_policy(payload: PolicyUpdateDTO, db: Session = Depends(get_db)):
    policy = upsert_primary_policy(db, payload)
    return PolicyResponseDTO(
        id=policy.id, title=policy.title, content=policy.content,
        locale=policy.locale, policy_type=policy.policy_type,
    )

@router.post("/test-model", response_model=ModelTestResponseDTO)
async def test_model(payload: ModelTestRequestDTO, db: Session = Depends(get_db)):
    result = await test_admin_configured_model(db, payload.prompt)
    return ModelTestResponseDTO(**result)

@router.get("/store-profile", response_model=StoreProfileDTO)
def store_profile(db: Session = Depends(get_db)):
    p = get_store_profile(db)
    return StoreProfileDTO(
        name=p.name, address=p.address, email=p.email,
        bank_name=p.bank_name, bank_account=p.bank_account,
        bank_beneficiary=p.bank_beneficiary, facebook_link=p.facebook_link,
        instagram_link=p.instagram_link,
    )

@router.put("/store-profile", response_model=StoreProfileDTO)
def put_store_profile(payload: StoreProfileDTO, db: Session = Depends(get_db)):
    p = update_store_profile(db, payload)
    return StoreProfileDTO(
        name=p.name, address=p.address, email=p.email,
        bank_name=p.bank_name, bank_account=p.bank_account,
        bank_beneficiary=p.bank_beneficiary, facebook_link=p.facebook_link,
        instagram_link=p.instagram_link,
    )

@router.get("/orders", response_model=List[OrderDTO])
def list_orders(db: Session = Depends(get_db)):
    orders = get_all_orders(db)
    return [
        OrderDTO(
            id=o.id, order_number=o.order_number, customer=o.customer,
            email=o.email, phone=o.phone, total=o.total, deposit=o.deposit,
            status=o.status.value.replace("_", " ").title(),
            expected_delivery=o.expected_delivery.isoformat(), payment_proof=o.payment_proof,
            items=[
                OrderItemDTO(
                    product_id=i.product_id,
                    name=i.product.name.get("vi") if i.product else "Unknown",
                    qty=i.qty, price=i.price,
                ) for i in o.items
            ],
        ) for o in orders
    ]

@router.patch("/orders/{order_id}/status", response_model=OrderDTO)
def patch_order_status(order_id: str, payload: OrderStatusUpdateDTO, db: Session = Depends(get_db)):
    o = update_order_status(db, order_id, payload.status)
    if not o: raise HTTPException(404, "Order not found")
    return OrderDTO(
        id=o.id, order_number=o.order_number, customer=o.customer,
        email=o.email, phone=o.phone, total=o.total, deposit=o.deposit,
        status=o.status.value.replace("_", " ").title(),
        expected_delivery=o.expected_delivery.isoformat(),
        items=[
            OrderItemDTO(
                product_id=i.product_id,
                name=i.product.name.get("vi") if i.product else "Unknown",
                qty=i.qty, price=i.price,
            ) for i in o.items
        ],
    )

@router.get("/users", response_model=List[UserDTO])
def list_users(db: Session = Depends(get_db)):
    users = get_all_users(db)
    return [UserDTO(id=u.id, email=u.email, username=u.username, full_name=u.full_name, role=u.role, permission=u.permission) for u in users]

@router.post("/users", response_model=UserDTO)
def create_user(payload: UserDTO, db: Session = Depends(get_db)):
    u = upsert_user(db, payload)
    return UserDTO(id=u.id, email=u.email, username=u.username, full_name=u.full_name, role=u.role, permission=u.permission)

@router.delete("/users/{user_id}")
def remove_user(user_id: str, db: Session = Depends(get_db)):
    success, reason = delete_user(db, user_id)
    if success: return {"success": True}
    raise HTTPException(404 if reason == "not_found" else 409)

@router.get("/repairs", response_model=List[RepairDTO])
def list_repairs(db: Session = Depends(get_db)):
    repairs = db.query(Repair).order_by(Repair.created_at.desc()).all()
    return [
        RepairDTO(
            id=r.id, customer_name=r.customer_name, device_name=r.device_name,
            issue=r.issue, status=r.status.value, created_at=r.created_at.isoformat(),
            notes=[RepairNoteDTO(id=n.id, content=n.content, created_at=n.created_at.isoformat()) for n in r.notes]
        ) for r in repairs
    ]

@router.patch("/repairs/{repair_id}/status")
def update_repair_status_endpoint(repair_id: str, status: str, db: Session = Depends(get_db)):
    r = db.get(Repair, repair_id)
    if not r: raise HTTPException(404)
    try:
        r.status = RepairStatus(status.lower())
    except ValueError:
        # Fallback to member name check
        try:
            r.status = RepairStatus[status.upper()]
        except KeyError:
            raise HTTPException(400, f"Invalid status: {status}")
    db.commit()
    return {"success": True}

@router.post("/repairs", response_model=RepairDTO)
def create_repair_endpoint(payload: RepairDTO, db: Session = Depends(get_db)):
    r = Repair(
        id=str(uuid.uuid4()),
        customer_name=payload.customer_name,
        device_name=payload.device_name,
        issue=payload.issue,
        status=RepairStatus.RECEIVED
    )
    db.add(r)
    for note in payload.notes:
        db.add(RepairNote(id=str(uuid.uuid4()), repair_id=r.id, content=note.content))
    db.commit()
    db.refresh(r)
    return RepairDTO(
        id=r.id, customer_name=r.customer_name, device_name=r.device_name,
        issue=r.issue, status=r.status.value, created_at=r.created_at.isoformat(),
        notes=[RepairNoteDTO(id=n.id, content=n.content, created_at=n.created_at.isoformat()) for n in r.notes]
    )


@router.put("/repairs/{repair_id}", response_model=RepairDTO)
def update_repair_endpoint(repair_id: str, payload: RepairDTO, db: Session = Depends(get_db)):
    r = db.get(Repair, repair_id)
    if not r:
        raise HTTPException(404, "Repair not found")
    r.customer_name = payload.customer_name
    r.device_name = payload.device_name
    r.issue = payload.issue
    try:
        r.status = RepairStatus(payload.status.lower())
    except ValueError:
        pass
    r.notes.clear()
    for note in payload.notes:
        r.notes.append(RepairNote(id=note.id or str(uuid.uuid4()), content=note.content))
    db.commit()
    db.refresh(r)
    return RepairDTO(
        id=r.id, customer_name=r.customer_name, device_name=r.device_name,
        issue=r.issue, status=r.status.value, created_at=r.created_at.isoformat(),
        notes=[RepairNoteDTO(id=n.id, content=n.content, created_at=n.created_at.isoformat()) for n in r.notes]
    )


@router.delete("/repairs/{repair_id}")
def remove_repair_endpoint(repair_id: str, db: Session = Depends(get_db)):
    r = db.get(Repair, repair_id)
    if not r:
        raise HTTPException(404, "Repair not found")
    db.delete(r)
    db.commit()
    return {"success": True}

@router.get("/theme", response_model=ThemeSettingsResponseDTO)
def get_theme_settings_endpoint(db: Session = Depends(get_db)):
    setting = get_theme_settings(db)
    palettes = get_all_palettes(db)
    return ThemeSettingsResponseDTO(
        active_palette_id=setting.active_palette_id,
        palettes=[
            ThemePaletteDTO(
                id=p.id, name=p.name, is_preset=p.is_preset,
                light_main=p.light_main, light_sub=p.light_sub, light_accent=p.light_accent,
                dark_main=p.dark_main, dark_sub=p.dark_sub, dark_accent=p.dark_accent
            ) for p in palettes
        ]
    )

@router.post("/theme/palettes", response_model=ThemePaletteDTO)
def create_palette_endpoint(payload: ThemePaletteDTO, db: Session = Depends(get_db)):
    p = upsert_palette(db, payload)
    return ThemePaletteDTO(
        id=p.id, name=p.name, is_preset=p.is_preset,
        light_main=p.light_main, light_sub=p.light_sub, light_accent=p.light_accent,
        dark_main=p.dark_main, dark_sub=p.dark_sub, dark_accent=p.dark_accent
    )

@router.post("/theme/activate/{palette_id}")
def activate_palette_endpoint(palette_id: str, db: Session = Depends(get_db)):
    if set_active_palette(db, palette_id): return {"success": True}
    raise HTTPException(404)

@router.get("/store-settings", response_model=StoreSettingsDTO)
def get_store_settings(db: Session = Depends(get_db)):
    s = db.query(StoreSetting).filter_by(id="default").first()
    if not s:
        s = StoreSetting(id="default", deposit_percentage=20)
        db.add(s)
        db.commit()
    return StoreSettingsDTO(deposit_percentage=s.deposit_percentage)

@router.patch("/store-settings", response_model=StoreSettingsDTO)
def update_store_settings(payload: StoreSettingsDTO, db: Session = Depends(get_db)):
    s = db.query(StoreSetting).filter_by(id="default").first()
    if not s: raise HTTPException(404)
    s.deposit_percentage = payload.deposit_percentage
    db.commit()
    return StoreSettingsDTO(deposit_percentage=s.deposit_percentage)


@router.post("/test-telegram")
async def test_telegram(payload: TelegramTestDTO):
    import httpx
    url = f"https://api.telegram.org/bot{payload.token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.post(url, json={
                "chat_id": payload.chat_id,
                "text": "🔔 Đây là tin nhắn thử nghiệm từ hệ thống H-TECH."
            })
            if res.status_code == 200:
                return {"success": True}
            raise HTTPException(400, "Telegram API returned error")
    except Exception as e:
        raise HTTPException(500, str(e))
