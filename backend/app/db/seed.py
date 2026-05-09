import uuid

from sqlalchemy.orm import Session

from app.models.models import Category, Product, StorePolicy, Voucher
from app.services.embeddings import embed_query


def seed_data(db: Session) -> None:
    products = [
        Product(
            id="p1",
            slug="lumiere-lace-gown",
            name={"en": "Lumiere Lace Gown", "vi": "Dam Cuoi Ren Lumiere"},
            category=Category.DRESS,
            price=1_200_000,
            price_per_day=True,
            image="/images/dress-1.jpg",
            gallery=["/images/dress-1.jpg"],
            description={"en": "Romantic lace wedding dress", "vi": "Dam cuoi ren lang man"},
            details={"en": ["Ivory lace"], "vi": ["Ren mau nga"]},
            available=True,
            trending=True,
            discount=0,
            embedding=embed_query("Lumiere lace wedding dress romantic"),
        ),
        Product(
            id="pk1",
            slug="golden-hour-package",
            name={"en": "Golden Hour Package", "vi": "Goi chup Golden Hour"},
            category=Category.PACKAGE,
            price=12_500_000,
            price_per_day=False,
            image="/images/package-1.jpg",
            gallery=["/images/package-1.jpg"],
            description={"en": "Pre-wedding photo package", "vi": "Goi chup anh cuoi"},
            details={"en": ["80 edited photos"], "vi": ["80 anh da chinh sua"]},
            available=True,
            trending=True,
            discount=0,
            embedding=embed_query("pre wedding photography package"),
        ),
    ]
    policies = [
        StorePolicy(
            id=str(uuid.uuid4()),
            policy_type="returns",
            locale="vi",
            title="Hoan tra va boi thuong",
            content="Tien coc la 20%. VAT duoc tinh theo hoa don.",
            embedding=embed_query("return policy deposit 20 percent VAT invoice"),
        )
    ]
    vouchers = [Voucher(id=str(uuid.uuid4()), code="WELCOME10", discount_percent=10, active=True)]

    for model in [*products, *policies, *vouchers]:
        db.merge(model)
    db.commit()
