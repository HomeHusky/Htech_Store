from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.models import Product, Category
from app.schemas.admin import ProductDTO
from app.services.admin_service import get_all_products
from app.services.hybrid_search import hybrid_search_products

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("", response_model=List[ProductDTO])
def list_public_products(db: Session = Depends(get_db)):
    products = get_all_products(db)
    return [
        ProductDTO(
            id=p.id, slug=p.slug, name=p.name, brand=p.brand, category=p.category,
            tagline=p.tagline or {"vi": "", "en": ""}, basePrice=p.price, price_per_day=p.price_per_day, 
            image=p.image, gallery=p.gallery, description=p.description, 
            details=p.details, highlightSpecs=p.highlight_specs,
            available=p.available, trending=p.trending, isNew=p.is_new,
            stock=p.stock, rating=p.rating, reviewCount=p.review_count,
            discountPercent=p.discount,
        ) for p in products
    ]

@router.get("/search")
def search_products(q: str, db: Session = Depends(get_db)):
    products = hybrid_search_products(db, q)
    return {"products": products}

@router.get("/{slug}", response_model=ProductDTO)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.slug == slug).first()
    if not p:
        raise HTTPException(404, "Product not found")
    return ProductDTO(
        id=p.id, slug=p.slug, name=p.name, brand=p.brand, category=p.category,
        tagline=p.tagline or {"vi": "", "en": ""}, basePrice=p.price, price_per_day=p.price_per_day, 
        image=p.image, gallery=p.gallery, description=p.description, 
        details=p.details, highlightSpecs=p.highlight_specs,
        available=p.available, trending=p.trending, isNew=p.is_new,
        stock=p.stock, rating=p.rating, reviewCount=p.review_count,
        discountPercent=p.discount,
    )
