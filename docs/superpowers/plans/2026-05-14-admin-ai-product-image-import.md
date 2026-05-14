# Admin AI Product Image Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build admin bulk image import where each row of images creates one AI-generated product saved as pending review.

**Architecture:** Add an explicit AI review status to products, a dedicated backend AI import service, an NDJSON streaming admin endpoint, and a focused frontend import modal. AI-created products are saved in `products` with `available=false` and `ai_status="pending_review"` until an admin confirms or ignores them.

**Tech Stack:** FastAPI, SQLAlchemy, Alembic, Pydantic v2, LangChain Gemini/OpenAI chat models, Next.js 16, React 19, TypeScript, Tailwind, shadcn-style local UI.

---

## File Structure

- Modify `backend/app/models/models.py`
  - Add `Product.ai_status`.
- Add `backend/alembic/versions/20260514_0014_product_ai_status.py`
  - Add the `products.ai_status` column with default `manual`.
- Modify `backend/app/schemas/admin.py`
  - Add product AI status fields and `AIProductStatusUpdateDTO`.
- Modify `backend/app/services/admin_service.py`
  - Preserve `ai_status` in product upserts, add DTO mapping, add review status update.
- Add `backend/app/services/ai_product_import.py`
  - Pure normalization, NDJSON events, upload grouping, slug handling, and product creation orchestration.
- Add `backend/app/services/ai_product_vision.py`
  - LLM vision extraction for a single product row.
- Modify `backend/app/api/admin.py`
  - Add streaming AI import endpoint and AI review action endpoint.
- Modify `backend/app/api/products.py`
  - Keep public product list/detail limited to sellable products.
- Modify `backend/app/services/hybrid_search.py`
  - Keep semantic and keyword product search limited to available products.
- Add `backend/app/tests/test_ai_product_import.py`
  - Test normalization, persistence defaults, and NDJSON event formatting without real LLM calls.
- Modify `frontend/lib/api.ts`
  - Export the backend URL builder for streaming fetches.
- Modify `frontend/lib/products-api.ts`
  - Add `ai_status` to `ProductDTO`.
- Add `frontend/lib/ai-product-import.ts`
  - Build grouped `FormData` and parse streamed NDJSON events.
- Add `frontend/components/admin/ai-product-import-modal.tsx`
  - Admin row-based image upload modal with streamed progress.
- Modify `frontend/app/admin/products/page.tsx`
  - Add AI import button, filter, pending badge, confirm/ignore actions, and modal integration.

---

### Task 1: Backend Product AI Status Schema

**Files:**
- Modify: `backend/app/models/models.py`
- Modify: `backend/app/schemas/admin.py`
- Modify: `backend/app/services/admin_service.py`
- Add: `backend/alembic/versions/20260514_0014_product_ai_status.py`
- Test: `backend/app/tests/test_ai_product_import.py`

- [ ] **Step 1: Run GitNexus impact before editing backend symbols**

Run:

```powershell
npx.cmd gitnexus impact --target Product --direction upstream
npx.cmd gitnexus impact --target ProductDTO --direction upstream
npx.cmd gitnexus impact --target upsert_product --direction upstream
```

Expected: report the risk. If any result is HIGH or CRITICAL, pause and tell the user the direct callers and affected processes before editing.

- [ ] **Step 2: Write failing DTO/status test**

Create `backend/app/tests/test_ai_product_import.py` with:

```python
from app.schemas.admin import ProductDTO


def test_product_dto_exposes_ai_status_default() -> None:
    product = ProductDTO(
        slug="macbook-pro-ai",
        name={"vi": "MacBook Pro AI", "en": "MacBook Pro AI"},
        category="laptop",
        basePrice=1,
        image="/static/uploads/macbook.jpg",
    )

    assert product.ai_status == "manual"
    assert product.model_dump()["ai_status"] == "manual"
```

- [ ] **Step 3: Run test to verify it fails**

Run:

```powershell
cd backend
pytest app/tests/test_ai_product_import.py::test_product_dto_exposes_ai_status_default -q
```

Expected: FAIL because `ProductDTO` has no `ai_status` field.

- [ ] **Step 4: Add model column**

In `backend/app/models/models.py`, add this column inside `class Product` near `available`:

```python
    ai_status: Mapped[str] = mapped_column(String, nullable=False, default="manual", index=True)
```

- [ ] **Step 5: Add migration**

Create `backend/alembic/versions/20260514_0014_product_ai_status.py`:

```python
"""Add AI review status to products.

Revision ID: 20260514_0014
Revises: 20260510_0013
Create Date: 2026-05-14
"""

from alembic import op
import sqlalchemy as sa


revision = "20260514_0014"
down_revision = "20260510_0013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("ai_status", sa.String(), nullable=False, server_default="manual"),
    )
    op.create_index("ix_products_ai_status", "products", ["ai_status"])
    op.alter_column("products", "ai_status", server_default=None)


def downgrade() -> None:
    op.drop_index("ix_products_ai_status", table_name="products")
    op.drop_column("products", "ai_status")
```

- [ ] **Step 6: Add schema fields**

In `backend/app/schemas/admin.py`, add:

```python
AI_PRODUCT_STATUSES = {"manual", "pending_review", "confirmed", "ignored"}
```

Add this field to `ProductDTO`:

```python
    ai_status: str = "manual"
```

Add this validator to `ProductDTO`:

```python
    @field_validator("ai_status")
    @classmethod
    def ai_status_must_be_known(cls, v: str):
        value = (v or "manual").strip()
        if value not in AI_PRODUCT_STATUSES:
            raise ValueError("Trang thai AI cua san pham khong hop le")
        return value
```

Add this DTO near `PromoUpdateDTO`:

```python
class AIProductStatusUpdateDTO(BaseModel):
    ai_status: str

    @field_validator("ai_status")
    @classmethod
    def ai_status_must_be_review_action(cls, v: str):
        value = (v or "").strip()
        if value not in {"confirmed", "ignored"}:
            raise ValueError("Chi ho tro confirmed hoac ignored")
        return value
```

- [ ] **Step 7: Add product DTO mapper and status persistence**

In `backend/app/services/admin_service.py`, add this helper after `get_all_products`:

```python
def product_to_dto(product: Product) -> ProductDTO:
    return ProductDTO(
        id=product.id,
        slug=product.slug,
        name=product.name,
        brand=product.brand,
        category=product.category,
        tagline=product.tagline or {"vi": "", "en": ""},
        basePrice=product.price,
        is_trade_in=product.is_trade_in,
        image=product.image,
        gallery=product.gallery,
        description=product.description,
        details=product.details,
        highlightSpecs=product.highlight_specs,
        available=product.available,
        trending=product.trending,
        isNew=product.is_new,
        stock=product.stock,
        rating=product.rating,
        reviewCount=product.review_count,
        discountPercent=product.discount,
        ai_status=product.ai_status or "manual",
        created_at=product.created_at.isoformat() if product.created_at else None,
    )
```

In `upsert_product`, after `product.discount = payload.discountPercent`, add:

```python
    product.ai_status = payload.ai_status or "manual"
```

Add:

```python
def update_product_ai_status(db: Session, product_id: str, ai_status: str) -> Product | None:
    product = db.get(Product, product_id)
    if not product:
        return None
    product.ai_status = ai_status
    db.commit()
    db.refresh(product)
    return product
```

- [ ] **Step 8: Run test to verify it passes**

Run:

```powershell
cd backend
pytest app/tests/test_ai_product_import.py::test_product_dto_exposes_ai_status_default -q
```

Expected: PASS.

- [ ] **Step 9: Commit Task 1**

Run:

```powershell
git add backend/app/models/models.py backend/app/schemas/admin.py backend/app/services/admin_service.py backend/alembic/versions/20260514_0014_product_ai_status.py backend/app/tests/test_ai_product_import.py
git commit -m "feat: add AI review status to products"
```

---

### Task 2: AI Product Import Normalization Service

**Files:**
- Add: `backend/app/services/ai_product_import.py`
- Modify: `backend/app/tests/test_ai_product_import.py`

- [ ] **Step 1: Write failing normalization tests**

Append to `backend/app/tests/test_ai_product_import.py`:

```python
from app.services.ai_product_import import format_ndjson_event, normalize_ai_product_payload


def test_normalize_ai_product_payload_creates_pending_review_draft() -> None:
    product = normalize_ai_product_payload(
        raw={
            "name": {"vi": "MacBook Pro 14 M3", "en": "MacBook Pro 14 M3"},
            "brand": "Apple",
            "category": "laptop",
            "basePrice": 42000000,
            "description": {"vi": "May MacBook Pro tu anh upload"},
            "highlightSpecs": ["M3", "16GB RAM", "512GB SSD"],
            "details": {"cpu": "Apple M3", "ram": "16GB"},
            "confidence": 0.74,
            "notes": ["Gia do AI uoc tinh"],
        },
        image_urls=["/static/uploads/front.jpg", "/static/uploads/back.jpg"],
        fallback_category="laptop",
        row_id="row-1",
    )

    assert product.slug == "macbook-pro-14-m3"
    assert product.available is False
    assert product.stock == 0
    assert product.ai_status == "pending_review"
    assert product.image == "/static/uploads/front.jpg"
    assert product.gallery == ["/static/uploads/front.jpg", "/static/uploads/back.jpg"]
    assert product.details["ai_generated"] is True
    assert product.details["ai_confidence"] == 0.74
    assert product.details["ai_notes"] == ["Gia do AI uoc tinh"]
    assert product.details["ai_source_images"] == ["/static/uploads/front.jpg", "/static/uploads/back.jpg"]


def test_format_ndjson_event_ends_with_newline() -> None:
    line = format_ndjson_event("created", "row-1", {"product_id": "p1"})

    assert line == '{"type":"created","row_id":"row-1","product_id":"p1"}\n'
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
cd backend
pytest app/tests/test_ai_product_import.py::test_normalize_ai_product_payload_creates_pending_review_draft app/tests/test_ai_product_import.py::test_format_ndjson_event_ends_with_newline -q
```

Expected: FAIL because `app.services.ai_product_import` does not exist.

- [ ] **Step 3: Create service with pure helpers**

Create `backend/app/services/ai_product_import.py`:

```python
import json
import re
import unicodedata
import uuid
from collections.abc import Iterable
from pathlib import Path
from typing import Any

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import Product
from app.schemas.admin import ProductDTO
from app.services.admin_service import upsert_product


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value.lower().strip())
    ascii_text = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")
    return slug or f"ai-product-{uuid.uuid4().hex[:8]}"


def format_ndjson_event(event_type: str, row_id: str | None = None, payload: dict[str, Any] | None = None) -> str:
    body = {"type": event_type}
    if row_id is not None:
        body["row_id"] = row_id
    if payload:
        body.update(payload)
    return json.dumps(body, ensure_ascii=False, separators=(",", ":")) + "\n"


def _localized(value: Any, fallback: str) -> dict[str, str]:
    if isinstance(value, dict):
        vi = str(value.get("vi") or value.get("en") or fallback).strip()
        en = str(value.get("en") or value.get("vi") or fallback).strip()
        return {"vi": vi or fallback, "en": en or fallback}
    text = str(value or fallback).strip() or fallback
    return {"vi": text, "en": text}


def _list_of_strings(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def normalize_ai_product_payload(
    raw: dict[str, Any],
    image_urls: list[str],
    fallback_category: str,
    row_id: str,
) -> ProductDTO:
    name = _localized(raw.get("name"), f"AI Product {row_id}")
    base_slug = str(raw.get("slug") or name["vi"])
    details = raw.get("details") if isinstance(raw.get("details"), dict) else {}
    notes = _list_of_strings(raw.get("notes"))
    confidence = raw.get("confidence", raw.get("ai_confidence", 0))
    try:
        confidence_value = float(confidence)
    except (TypeError, ValueError):
        confidence_value = 0.0

    details = {
        **details,
        "ai_generated": True,
        "ai_confidence": max(0.0, min(1.0, confidence_value)),
        "ai_notes": notes,
        "ai_source_images": image_urls,
    }

    price = raw.get("basePrice", raw.get("price", 1))
    try:
        base_price = max(1, int(price))
    except (TypeError, ValueError):
        base_price = 1

    return ProductDTO(
        slug=slugify(base_slug),
        name=name,
        brand=str(raw.get("brand") or "Htech").strip() or "Htech",
        category=str(raw.get("category") or fallback_category or "laptop").strip(),
        tagline=_localized(raw.get("tagline"), ""),
        basePrice=base_price,
        is_trade_in=bool(raw.get("is_trade_in", False)),
        image=image_urls[0] if image_urls else "/images/placeholder.jpg",
        gallery=image_urls,
        description=_localized(raw.get("description"), ""),
        details=details,
        highlightSpecs=_list_of_strings(raw.get("highlightSpecs")),
        available=False,
        trending=False,
        isNew=True,
        stock=0,
        rating=5,
        reviewCount=0,
        discountPercent=0,
        ai_status="pending_review",
    )


def ensure_unique_slug(db: Session, slug: str) -> str:
    candidate = slug
    suffix = 2
    while db.scalar(select(Product.id).where(Product.slug == candidate)):
        candidate = f"{slug}-{suffix}"
        suffix += 1
    return candidate


def create_ai_product(db: Session, payload: ProductDTO) -> Product:
    payload.slug = ensure_unique_slug(db, payload.slug)
    payload.available = False
    payload.ai_status = "pending_review"
    return upsert_product(db, payload)


def safe_upload_name(filename: str | None) -> str:
    raw_name = Path(filename or "image.jpg").name
    normalized = re.sub(r"[^A-Za-z0-9._-]+", "-", raw_name).strip("-")
    return normalized or "image.jpg"


async def save_upload_file(file: UploadFile) -> str:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4()}_{safe_upload_name(file.filename)}"
    path = upload_dir / filename
    path.write_bytes(await file.read())
    return f"/static/uploads/{filename}"


def group_form_files(items: Iterable[tuple[str, Any]]) -> dict[str, list[UploadFile]]:
    grouped: dict[str, list[UploadFile]] = {}
    for key, value in items:
        if not key.startswith("files:"):
            continue
        row_id = key.split(":", 1)[1]
        if hasattr(value, "filename") and hasattr(value, "read"):
            grouped.setdefault(row_id, []).append(value)
    return grouped
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```powershell
cd backend
pytest app/tests/test_ai_product_import.py::test_normalize_ai_product_payload_creates_pending_review_draft app/tests/test_ai_product_import.py::test_format_ndjson_event_ends_with_newline -q
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

Run:

```powershell
git add backend/app/services/ai_product_import.py backend/app/tests/test_ai_product_import.py
git commit -m "feat: normalize AI product imports"
```

---

### Task 3: AI Vision Extraction Client

**Files:**
- Add: `backend/app/services/ai_product_vision.py`
- Modify: `backend/app/tests/test_ai_product_import.py`

- [ ] **Step 1: Write failing tests for vision capability guard and JSON parser**

Append to `backend/app/tests/test_ai_product_import.py`:

```python
import pytest

from app.services.ai_product_vision import extract_json_object, provider_supports_vision


def test_extract_json_object_accepts_fenced_json() -> None:
    text = '```json\n{"name":{"vi":"iPhone 15 Pro"},"basePrice":25000000}\n```'

    assert extract_json_object(text)["name"]["vi"] == "iPhone 15 Pro"


def test_provider_supports_vision_rejects_phi4_and_ollama() -> None:
    assert provider_supports_vision("gemini", "gemini-1.5-flash") is True
    assert provider_supports_vision("openai", "gpt-4o-mini") is True
    assert provider_supports_vision("phi4", "Phi-4") is False
    assert provider_supports_vision("ollama", "llama3.2") is False
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
cd backend
pytest app/tests/test_ai_product_import.py::test_extract_json_object_accepts_fenced_json app/tests/test_ai_product_import.py::test_provider_supports_vision_rejects_phi4_and_ollama -q
```

Expected: FAIL because `app.services.ai_product_vision` does not exist.

- [ ] **Step 3: Create vision service**

Create `backend/app/services/ai_product_vision.py`:

```python
import base64
import json
import re
from pathlib import Path
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.admin_service import get_or_create_ai_settings


VISION_SYSTEM_PROMPT = (
    "You extract ecommerce product data for Htech Store from product images. "
    "Return only valid JSON. Never invent exact specs when unreadable; put uncertainty in notes."
)


VISION_USER_PROMPT = """
Analyze these images as one electronics product. Return JSON with:
name: {"vi": string, "en": string}
brand: string
category: one of laptop, pc, phone, tablet, accessory
tagline: {"vi": string, "en": string}
basePrice: integer VND estimate, use 1 if unknown
description: {"vi": string, "en": string}
details: object with visible specs
highlightSpecs: string[]
confidence: number from 0 to 1
notes: string[] explaining uncertain fields
"""


def provider_supports_vision(provider: str, model: str) -> bool:
    provider_key = provider.lower().strip()
    model_key = model.lower().strip()
    if provider_key == "gemini":
        return True
    if provider_key == "openai":
        return any(token in model_key for token in ("gpt-4o", "gpt-4.1", "o4"))
    return False


def extract_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, flags=re.DOTALL)
    if fenced:
        cleaned = fenced.group(1)
    else:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start >= 0 and end >= start:
            cleaned = cleaned[start : end + 1]
    data = json.loads(cleaned)
    if not isinstance(data, dict):
        raise ValueError("Vision model returned JSON that is not an object")
    return data


def _image_part(path: Path) -> dict[str, Any]:
    suffix = path.suffix.lower()
    mime = "image/png" if suffix == ".png" else "image/webp" if suffix == ".webp" else "image/jpeg"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{encoded}"}}


def _local_path_from_url(url: str) -> Path:
    prefix = "/static/uploads/"
    if not url.startswith(prefix):
        raise ValueError(f"Only uploaded local images are supported: {url}")
    return Path(settings.upload_dir) / url.removeprefix(prefix)


async def analyze_product_images(
    db: Session,
    image_urls: list[str],
    category_hint: str | None = None,
) -> dict[str, Any]:
    cfg = get_or_create_ai_settings(db)
    provider = cfg.chat_provider
    model = cfg.chat_model
    if not provider_supports_vision(provider, model):
        raise ValueError(f"Model {provider}/{model} does not support image analysis for product import")

    prompt = VISION_USER_PROMPT
    if category_hint:
        prompt = f"{prompt}\nAdmin category hint: {category_hint}"

    content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
    content.extend(_image_part(_local_path_from_url(url)) for url in image_urls)

    if provider == "openai":
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not configured")
        base_url = "https://models.inference.ai.azure.com" if settings.openai_api_key.startswith("github_pat_") else None
        llm = ChatOpenAI(
            model=model,
            openai_api_key=settings.openai_api_key,
            base_url=base_url,
            temperature=0.1,
            timeout=45,
            max_retries=0,
        )
    else:
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        llm = ChatGoogleGenerativeAI(
            model=model,
            google_api_key=settings.gemini_api_key,
            temperature=0.1,
            timeout=45,
            max_retries=0,
        )

    response = await llm.ainvoke([SystemMessage(content=VISION_SYSTEM_PROMPT), HumanMessage(content=content)])
    return extract_json_object(str(response.content))
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```powershell
cd backend
pytest app/tests/test_ai_product_import.py::test_extract_json_object_accepts_fenced_json app/tests/test_ai_product_import.py::test_provider_supports_vision_rejects_phi4_and_ollama -q
```

Expected: PASS.

- [ ] **Step 5: Commit Task 3**

Run:

```powershell
git add backend/app/services/ai_product_vision.py backend/app/tests/test_ai_product_import.py
git commit -m "feat: add AI product vision extraction"
```

---

### Task 4: Admin Streaming API and Review Actions

**Files:**
- Modify: `backend/app/api/admin.py`
- Modify: `backend/app/services/ai_product_import.py`
- Modify: `backend/app/tests/test_ai_product_import.py`

- [ ] **Step 1: Run GitNexus impact before editing API handlers**

Run:

```powershell
npx.cmd gitnexus impact --target create_product --direction upstream
npx.cmd gitnexus impact --target list_products --direction upstream
npx.cmd gitnexus impact --target update_product --direction upstream
```

Expected: report the risk. Existing handlers will be refactored to use `product_to_dto`; warn the user first if HIGH or CRITICAL.

- [ ] **Step 2: Write failing stream generator test**

Append to `backend/app/tests/test_ai_product_import.py`:

```python
import json
from types import SimpleNamespace

import pytest

from app.services.ai_product_import import run_ai_product_row_import


class FakeDb:
    def scalar(self, stmt):
        return None


@pytest.mark.asyncio
async def test_run_ai_product_row_import_emits_created_event(monkeypatch) -> None:
    async def fake_analyzer(db, image_urls, category_hint=None):
        return {
            "name": {"vi": "Lenovo ThinkPad X1"},
            "brand": "Lenovo",
            "category": category_hint or "laptop",
            "basePrice": 30000000,
            "confidence": 0.8,
            "notes": [],
        }

    def fake_create(db, payload):
        return SimpleNamespace(id="p1", slug=payload.slug)

    monkeypatch.setattr("app.services.ai_product_import.analyze_product_images", fake_analyzer)
    monkeypatch.setattr("app.services.ai_product_import.create_ai_product", fake_create)

    events = []
    async for line in run_ai_product_row_import(
        db=FakeDb(),
        row={"id": "row-1", "category": "laptop"},
        image_urls=["/static/uploads/x1.jpg"],
    ):
        events.append(json.loads(line))

    assert [event["type"] for event in events] == ["analyzing", "creating", "created"]
    assert events[-1]["product"]["slug"] == "lenovo-thinkpad-x1"
```

- [ ] **Step 3: Run test to verify it fails**

Run:

```powershell
cd backend
pytest app/tests/test_ai_product_import.py::test_run_ai_product_row_import_emits_created_event -q
```

Expected: FAIL because `run_ai_product_row_import` does not exist.

- [ ] **Step 4: Add row import generator**

In `backend/app/services/ai_product_import.py`, add imports:

```python
from app.services.admin_service import product_to_dto
from app.services.ai_product_vision import analyze_product_images
```

Add:

```python
async def run_ai_product_row_import(
    db: Session,
    row: dict[str, Any],
    image_urls: list[str],
):
    row_id = str(row.get("id") or uuid.uuid4())
    try:
        yield format_ndjson_event("analyzing", row_id, {"image_count": len(image_urls)})
        raw = await analyze_product_images(db, image_urls, category_hint=row.get("category"))
        yield format_ndjson_event("creating", row_id)
        payload = normalize_ai_product_payload(
            raw=raw,
            image_urls=image_urls,
            fallback_category=str(row.get("category") or "laptop"),
            row_id=row_id,
        )
        product = create_ai_product(db, payload)
        yield format_ndjson_event(
            "created",
            row_id,
            {"product": product_to_dto(product).model_dump()},
        )
    except Exception as exc:
        yield format_ndjson_event("failed", row_id, {"error": str(exc)})
```

- [ ] **Step 5: Refactor admin product responses through mapper**

In `backend/app/api/admin.py`, import:

```python
import json
from fastapi import Request
from fastapi.responses import StreamingResponse
```

Extend schema imports with:

```python
    AIProductStatusUpdateDTO,
```

Extend service imports with:

```python
    product_to_dto, update_product_ai_status,
```

Add service imports:

```python
from app.services.ai_product_import import (
    format_ndjson_event,
    group_form_files,
    run_ai_product_row_import,
    save_upload_file,
)
```

Replace repeated `ProductDTO(...)` returns in `list_products`, `create_product`, `update_product`, and `update_promo` with:

```python
    return [product_to_dto(p) for p in products]
```

and:

```python
    return product_to_dto(p)
```

- [ ] **Step 6: Add streaming endpoint and review endpoint**

In `backend/app/api/admin.py`, after `update_promo`, add:

```python
@router.patch("/products/{product_id}/ai-status", response_model=ProductDTO)
def update_ai_status(product_id: str, payload: AIProductStatusUpdateDTO, db: Session = Depends(get_db)):
    product = update_product_ai_status(db, product_id, payload.ai_status)
    if not product:
        raise HTTPException(404, "Product not found")
    return product_to_dto(product)


@router.post("/products/ai-create/stream")
async def ai_create_products_stream(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    rows_raw = form.get("rows")
    try:
        rows = json.loads(str(rows_raw or "[]"))
    except json.JSONDecodeError:
        raise HTTPException(400, "Invalid rows JSON")
    if not isinstance(rows, list) or not rows:
        raise HTTPException(400, "At least one row is required")

    grouped_files = group_form_files(form.multi_items())

    async def event_stream():
        created = 0
        failed = 0
        yield format_ndjson_event("received", payload={"row_count": len(rows)})
        for row in rows:
            row_id = str(row.get("id") or uuid.uuid4())
            files = grouped_files.get(row_id, [])
            if not files:
                failed += 1
                yield format_ndjson_event("failed", row_id, {"error": "No images selected for this row"})
                continue
            try:
                yield format_ndjson_event("uploading", row_id, {"image_count": len(files)})
                image_urls = [await save_upload_file(file) for file in files]
                yield format_ndjson_event("uploaded", row_id, {"image_urls": image_urls})
                async for line in run_ai_product_row_import(db, {**row, "id": row_id}, image_urls):
                    event = json.loads(line)
                    if event["type"] == "created":
                        created += 1
                    if event["type"] == "failed":
                        failed += 1
                    yield line
            except Exception as exc:
                failed += 1
                yield format_ndjson_event("failed", row_id, {"error": str(exc)})
        yield format_ndjson_event("done", payload={"created": created, "failed": failed})

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")
```

- [ ] **Step 7: Run focused tests**

Run:

```powershell
cd backend
pytest app/tests/test_ai_product_import.py -q
```

Expected: PASS.

- [ ] **Step 8: Commit Task 4**

Run:

```powershell
git add backend/app/api/admin.py backend/app/services/ai_product_import.py backend/app/tests/test_ai_product_import.py
git commit -m "feat: stream AI product creation"
```

---

### Task 5: Keep AI Drafts Out of Public Product Surfaces

**Files:**
- Modify: `backend/app/api/products.py`
- Modify: `backend/app/services/hybrid_search.py`

- [ ] **Step 1: Run GitNexus impact before editing public product/search symbols**

Run:

```powershell
npx.cmd gitnexus impact --target list_public_products --direction upstream
npx.cmd gitnexus impact --target get_product_by_slug --direction upstream
npx.cmd gitnexus impact --target hybrid_search_products --direction upstream
```

Expected: report the risk. Warn the user first if HIGH or CRITICAL.

- [ ] **Step 2: Update public product list and detail**

In `backend/app/api/products.py`, change the query in `list_public_products` after `products = get_all_products(...)`:

```python
    products = [product for product in products if product.available]
```

In `get_product_by_slug`, change the not-found check:

```python
    if not p or not p.available:
        raise HTTPException(404, "Product not found")
```

Replace response DTO construction in both functions with `product_to_dto(p)` after adding this import:

```python
from app.services.admin_service import get_all_products, product_to_dto
```

- [ ] **Step 3: Update hybrid product SQL**

In `backend/app/services/hybrid_search.py`, add `p.available = true` to both semantic and keyword product CTEs:

```sql
          WHERE p.embedding IS NOT NULL
            AND p.available = true
            AND (CAST(:category AS text) IS NULL OR p.category::text = CAST(:category AS text))
```

and:

```sql
          WHERE p.search_vector @@ websearch_to_tsquery('simple', :query)
            AND p.available = true
            AND (CAST(:category AS text) IS NULL OR p.category::text = CAST(:category AS text))
```

- [ ] **Step 4: Run backend smoke tests**

Run:

```powershell
cd backend
pytest app/tests/test_api_health.py app/tests/test_hybrid_helpers.py -q
```

Expected: PASS.

- [ ] **Step 5: Commit Task 5**

Run:

```powershell
git add backend/app/api/products.py backend/app/services/hybrid_search.py
git commit -m "fix: hide unavailable products from public search"
```

---

### Task 6: Frontend Streaming Client and Product Types

**Files:**
- Modify: `frontend/lib/api.ts`
- Modify: `frontend/lib/products-api.ts`
- Add: `frontend/lib/ai-product-import.ts`

- [ ] **Step 1: Run GitNexus impact before editing frontend API helpers**

Run:

```powershell
npx.cmd gitnexus impact --target fetchAdminProducts --direction upstream
npx.cmd gitnexus impact --target toStoreProduct --direction upstream
```

Expected: report the risk. Warn the user first if HIGH or CRITICAL.

- [ ] **Step 2: Export API URL builder**

In `frontend/lib/api.ts`, change:

```typescript
const API_BASE_URL =
```

to:

```typescript
export const API_BASE_URL =
```

Change:

```typescript
function buildUrl(path: string, params?: RequestConfig['params']) {
```

to:

```typescript
export function buildApiUrl(path: string, params?: RequestConfig['params']) {
```

Then change the `fetch` call from:

```typescript
  const response = await fetch(buildUrl(path, params), {
```

to:

```typescript
  const response = await fetch(buildApiUrl(path, params), {
```

- [ ] **Step 3: Add frontend product AI status type**

In `frontend/lib/products-api.ts`, add before `ProductDTO`:

```typescript
export type ProductAIStatus = 'manual' | 'pending_review' | 'confirmed' | 'ignored'
```

Add to `ProductDTO`:

```typescript
  ai_status?: ProductAIStatus
```

In `searchRowToStoreProduct`, add:

```typescript
    ai_status: 'manual',
```

- [ ] **Step 4: Create streaming client**

Create `frontend/lib/ai-product-import.ts`:

```typescript
import { buildApiUrl } from '@/lib/api'
import type { ProductDTO } from '@/lib/products-api'

export type AIImportRowInput = {
  id: string
  category: string
  files: File[]
}

export type AIImportEvent =
  | { type: 'received'; row_count: number }
  | { type: 'uploading'; row_id: string; image_count: number }
  | { type: 'uploaded'; row_id: string; image_urls: string[] }
  | { type: 'analyzing'; row_id: string; image_count: number }
  | { type: 'creating'; row_id: string }
  | { type: 'created'; row_id: string; product: ProductDTO }
  | { type: 'failed'; row_id: string; error: string }
  | { type: 'done'; created: number; failed: number }

export function buildAIProductImportFormData(rows: AIImportRowInput[]) {
  const formData = new FormData()
  formData.append('rows', JSON.stringify(rows.map(({ id, category }) => ({ id, category }))))
  rows.forEach((row) => {
    row.files.forEach((file) => {
      formData.append(`files:${row.id}`, file)
    })
  })
  return formData
}

export async function streamAIProductImport(
  rows: AIImportRowInput[],
  onEvent: (event: AIImportEvent) => void,
) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('htech-auth-token') : null
  const response = await fetch(buildApiUrl('/admin/products/ai-create/stream'), {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: buildAIProductImportFormData(rows),
  })

  if (!response.ok || !response.body) {
    throw new Error(`AI import failed with status ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    lines.filter(Boolean).forEach((line) => onEvent(JSON.parse(line) as AIImportEvent))
  }

  if (buffer.trim()) {
    onEvent(JSON.parse(buffer) as AIImportEvent)
  }
}
```

- [ ] **Step 5: Run frontend type/build check**

Run:

```powershell
cd frontend
pnpm.cmd build
```

Expected: build exits 0.

- [ ] **Step 6: Commit Task 6**

Run:

```powershell
git add frontend/lib/api.ts frontend/lib/products-api.ts frontend/lib/ai-product-import.ts
git commit -m "feat: add AI product import streaming client"
```

---

### Task 7: AI Product Import Modal

**Files:**
- Add: `frontend/components/admin/ai-product-import-modal.tsx`

- [ ] **Step 1: Create modal component**

Create `frontend/components/admin/ai-product-import-modal.tsx`:

```typescript
'use client'

import { useMemo, useState } from 'react'
import { ImagePlus, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { streamAIProductImport, type AIImportEvent, type AIImportRowInput } from '@/lib/ai-product-import'
import type { ProductDTO } from '@/lib/products-api'
import { cn } from '@/lib/utils'

type Category = {
  id: string
  slug: string
  name: { vi: string; en: string }
}

type RowState = AIImportRowInput & {
  status: string
  imageUrls: string[]
  product?: ProductDTO
  error?: string
}

function newRow(category: string): RowState {
  return {
    id: crypto.randomUUID(),
    category,
    files: [],
    status: 'waiting',
    imageUrls: [],
  }
}

export function AIProductImportModal({
  open,
  categories,
  onClose,
  onCreated,
  onEditProduct,
}: {
  open: boolean
  categories: Category[]
  onClose: () => void
  onCreated: () => Promise<void>
  onEditProduct: (product: ProductDTO) => void
}) {
  const defaultCategory = categories[0]?.id || 'laptop'
  const [rows, setRows] = useState<RowState[]>(() => [newRow(defaultCategory)])
  const [running, setRunning] = useState(false)
  const [summary, setSummary] = useState('')
  const canStart = rows.some((row) => row.files.length > 0) && !running

  const createdProducts = useMemo(() => rows.flatMap((row) => (row.product ? [row.product] : [])), [rows])

  const patchRow = (rowId: string, patch: Partial<RowState>) => {
    setRows((current) => current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)))
  }

  const handleEvent = (event: AIImportEvent) => {
    if (event.type === 'received') {
      setSummary(`Dang xu ly ${event.row_count} hang`)
      return
    }
    if (event.type === 'done') {
      setSummary(`Da tao ${event.created} san pham, loi ${event.failed}`)
      return
    }
    if (event.type === 'uploading') patchRow(event.row_id, { status: 'uploading' })
    if (event.type === 'uploaded') patchRow(event.row_id, { status: 'uploaded', imageUrls: event.image_urls })
    if (event.type === 'analyzing') patchRow(event.row_id, { status: 'analyzing' })
    if (event.type === 'creating') patchRow(event.row_id, { status: 'creating' })
    if (event.type === 'created') patchRow(event.row_id, { status: 'created', product: event.product })
    if (event.type === 'failed') patchRow(event.row_id, { status: 'failed', error: event.error })
  }

  const startImport = async () => {
    setRunning(true)
    setSummary('')
    setRows((current) => current.map((row) => ({ ...row, status: row.files.length ? 'queued' : 'failed', error: row.files.length ? undefined : 'Chua chon anh' })))
    try {
      await streamAIProductImport(rows.filter((row) => row.files.length > 0), handleEvent)
      await onCreated()
    } catch (error) {
      setSummary(error instanceof Error ? error.message : 'Khong the tao san pham bang AI')
    } finally {
      setRunning(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-foreground/60" onClick={running ? undefined : onClose} aria-label="Dong" />
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Them san pham bang AI</h2>
            <p className="mt-1 text-sm text-muted-foreground">Moi hang la mot san pham moi. Chon nhieu anh cho tung san pham.</p>
          </div>
          <button onClick={onClose} disabled={running} className="rounded-lg p-2 hover:bg-muted disabled:opacity-50" aria-label="Dong">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">{index + 1}</div>
                <select
                  value={row.category}
                  disabled={running}
                  onChange={(event) => patchRow(row.id, { category: event.target.value })}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                >
                  {categories.length === 0 && <option value={row.category}>{row.category}</option>}
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name.vi || category.slug}</option>
                  ))}
                </select>
                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">
                  <ImagePlus className="h-4 w-4" />
                  Chon anh
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={running}
                    onChange={(event) => patchRow(row.id, { files: Array.from(event.target.files || []) })}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-muted-foreground">{row.files.length} anh</span>
                <StatusPill status={row.status} />
                <button
                  onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                  disabled={running || rows.length === 1}
                  className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"
                  aria-label="Xoa hang"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {row.error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{row.error}</p>}
              {row.product && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{typeof row.product.name === 'string' ? row.product.name : row.product.name.vi}</p>
                    <p className="text-xs text-muted-foreground">{row.product.slug}</p>
                  </div>
                  <button onClick={() => onEditProduct(row.product!)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-card">
                    Chinh sua
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {summary || `${createdProducts.length} san pham da tao trong phien nay`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRows((current) => [...current, newRow(defaultCategory)])}
              disabled={running}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Them hang
            </button>
            <button
              onClick={startImport}
              disabled={!canStart}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              <Sparkles className={cn('h-4 w-4', running && 'animate-spin')} />
              {running ? 'Dang tao...' : 'Them bang AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone = status === 'created'
    ? 'border-green-200 bg-green-50 text-green-700'
    : status === 'failed'
      ? 'border-red-200 bg-red-50 text-red-600'
      : status === 'waiting'
        ? 'border-slate-200 bg-slate-100 text-slate-500'
        : 'border-blue-200 bg-blue-50 text-blue-700'

  return <span className={cn('rounded-lg border px-2.5 py-1 text-xs font-semibold', tone)}>{status}</span>
}
```

- [ ] **Step 2: Run frontend build**

Run:

```powershell
cd frontend
pnpm.cmd build
```

Expected: build exits 0.

- [ ] **Step 3: Commit Task 7**

Run:

```powershell
git add frontend/components/admin/ai-product-import-modal.tsx
git commit -m "feat: add AI product import modal"
```

---

### Task 8: Integrate AI Import Into Admin Products Page

**Files:**
- Modify: `frontend/app/admin/products/page.tsx`

- [ ] **Step 1: Run GitNexus impact before editing ProductsPage**

Run:

```powershell
npx.cmd gitnexus impact --target ProductsPage --direction upstream
```

Expected: report the risk. Warn the user first if HIGH or CRITICAL.

- [ ] **Step 2: Add imports and state**

In `frontend/app/admin/products/page.tsx`, update imports:

```typescript
import { CheckCircle2, Edit2, Plus, Search, Sparkles, Trash2, WandSparkles, XCircle } from 'lucide-react'
import { AIProductImportModal } from '@/components/admin/ai-product-import-modal'
```

Add status filter type:

```typescript
type ProductAIStatusFilter = 'all' | 'pending_review' | 'confirmed' | 'ignored' | 'manual'
```

Add state in `ProductsPage`:

```typescript
  const [aiStatusFilter, setAiStatusFilter] = useState<ProductAIStatusFilter>('all')
  const [aiImportOpen, setAiImportOpen] = useState(false)
  const [updatingAIStatusId, setUpdatingAIStatusId] = useState<string | null>(null)
```

- [ ] **Step 3: Add helper functions**

Add near `stockKey`:

```typescript
function aiStatusLabel(status?: string) {
  if (status === 'pending_review') return 'AI cho xac nhan'
  if (status === 'confirmed') return 'AI da xac nhan'
  if (status === 'ignored') return 'AI bo qua'
  return 'Thu cong'
}

function aiStatusClass(status?: string) {
  if (status === 'pending_review') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (status === 'confirmed') return 'border-green-200 bg-green-50 text-green-700'
  if (status === 'ignored') return 'border-slate-200 bg-slate-100 text-slate-500'
  return 'border-transparent bg-transparent text-muted-foreground'
}
```

Add inside `ProductsPage`:

```typescript
  const updateAIStatus = async (product: ProductDTO, aiStatus: 'confirmed' | 'ignored') => {
    setUpdatingAIStatusId(product.id)
    try {
      await api.patch(`/admin/products/${product.id}/ai-status`, { ai_status: aiStatus })
      await loadProducts()
    } finally {
      setUpdatingAIStatusId(null)
    }
  }

  const openAIProductForEdit = (product: ProductDTO) => {
    setAiImportOpen(false)
    openEditModal(product)
  }
```

- [ ] **Step 4: Add AI filter into filtered products**

Inside `filtered`, add:

```typescript
      const matchesAIStatus = aiStatusFilter === 'all' || (product.ai_status || 'manual') === aiStatusFilter
```

Change return condition to include:

```typescript
      return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesAIStatus
```

Add `aiStatusFilter` to the `useMemo` dependency list.

- [ ] **Step 5: Add button and select filter**

In the top action area before the manual add button, add:

```tsx
            <select value={aiStatusFilter} onChange={(event) => setAiStatusFilter(event.target.value as ProductAIStatusFilter)} className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
              <option value="all">Tat ca nguon tao</option>
              <option value="pending_review">AI cho xac nhan</option>
              <option value="confirmed">AI da xac nhan</option>
              <option value="ignored">AI bo qua</option>
              <option value="manual">Thu cong</option>
            </select>
```

Change the button area to include:

```tsx
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAiImportOpen(true)} className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/20">
              <WandSparkles className="h-4 w-4" />
              Them bang AI
            </button>
            <button onClick={openCreateModal} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-blue-dark">
              <Plus className="h-4 w-4" />
              {t('admin.add_product')}
            </button>
          </div>
```

- [ ] **Step 6: Show AI status badge and actions**

In product name cell under the brand, add:

```tsx
                          {product.ai_status && product.ai_status !== 'manual' && (
                            <span className={cn('mt-1 inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold', aiStatusClass(product.ai_status))}>
                              {aiStatusLabel(product.ai_status)}
                            </span>
                          )}
```

In the actions cell, before edit button, add:

```tsx
                            {product.ai_status === 'pending_review' && (
                              <>
                                <button onClick={() => updateAIStatus(product, 'confirmed')} disabled={updatingAIStatusId === product.id} className="rounded-lg p-2 text-green-600 hover:bg-green-500/10 disabled:opacity-50" aria-label="Xac nhan AI">
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => updateAIStatus(product, 'ignored')} disabled={updatingAIStatusId === product.id} className="rounded-lg p-2 text-muted-foreground hover:bg-slate-500/10 disabled:opacity-50" aria-label="Bo qua AI">
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
```

- [ ] **Step 7: Mount modal**

Before `<ProductEditModal`, add:

```tsx
      <AIProductImportModal
        open={aiImportOpen}
        categories={categories}
        onClose={() => setAiImportOpen(false)}
        onCreated={loadProducts}
        onEditProduct={openAIProductForEdit}
      />
```

- [ ] **Step 8: Run frontend build**

Run:

```powershell
cd frontend
pnpm.cmd build
```

Expected: build exits 0.

- [ ] **Step 9: Commit Task 8**

Run:

```powershell
git add frontend/app/admin/products/page.tsx
git commit -m "feat: wire AI product review into admin products"
```

---

### Task 9: End-to-End Verification

**Files:**
- No planned source edits.

- [ ] **Step 1: Run backend tests**

Run:

```powershell
cd backend
pytest app/tests -q
```

Expected: PASS.

- [ ] **Step 2: Run frontend build**

Run:

```powershell
cd frontend
pnpm.cmd build
```

Expected: build exits 0.

- [ ] **Step 3: Run GitNexus change detection**

Run:

```powershell
npx.cmd gitnexus detect-changes --scope all
```

Expected: changed symbols match admin product import, product DTO/model, product visibility, and frontend admin product UI. If existing unrelated dirty files still appear, list them separately and do not revert them.

- [ ] **Step 4: Manual local smoke check**

Run backend and frontend:

```powershell
cd backend
python run_app.py
```

In a second shell:

```powershell
cd frontend
pnpm.cmd dev
```

Open `http://localhost:3000/admin/products`, sign in, click `Them bang AI`, add one row with multiple images, and confirm:

- Stream status advances through upload and analysis states.
- Created product appears in the result list.
- Product table shows `AI cho xac nhan`.
- Product is `available=false`.
- Confirm action changes status to `confirmed`.
- Ignore action changes status to `ignored`.

- [ ] **Step 5: Final commit if verification required code fixes**

If verification required source fixes, commit them:

```powershell
git add backend frontend
git commit -m "fix: stabilize AI product import"
```

If no source fixes were needed, do not create an empty commit.
