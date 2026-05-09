from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class LocalizedText(BaseModel):
    en: str
    vi: str


class ProductCardDTO(BaseModel):
    id: str
    slug: str
    name: LocalizedText | str
    category: str
    price: int
    pricePerDay: bool = False
    image: str
    available: bool
    discount: int = 0
    search_score: float | None = None


class BookingItemDTO(BaseModel):
    productId: str
    qty: int = Field(ge=1)
    price: int = Field(ge=0)
    days: int | None = Field(default=None, ge=1)


class CustomerInfoDTO(BaseModel):
    name: str
    email: str
    phone: str
    note: str | None = None
    eventDate: date


class BookingSummaryDTO(BaseModel):
    orderId: str
    items: list[BookingItemDTO]
    subtotal: int
    deposit: int
    remaining: int
    status: str
    eventDate: date
    paymentLinkOrQr: str


class DebugSearchResultDTO(BaseModel):
    source_type: Literal["product", "policy"]
    id: str
    semantic_rank: int | None = None
    keyword_rank: int | None = None
    search_score: float


class ChatRequestDTO(BaseModel):
    session_id: str
    message: str
    locale: str = "vi"


class ChatResponseDTO(BaseModel):
    session_id: str
    answer: str
    tool: str | None = None
    payload: dict[str, Any] | None = None
    debug: dict[str, Any] | None = None
    created_at: datetime
