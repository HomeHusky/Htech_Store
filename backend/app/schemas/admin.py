from pydantic import BaseModel, Field, field_validator


class ModelOption(BaseModel):
    id: str
    label: str


class ProviderOption(BaseModel):
    id: str
    label: str
    models: list[ModelOption]


class ModelCatalogResponse(BaseModel):
    chat_providers: list[ProviderOption]
    embedding_providers: list[ProviderOption]


class CategoryDTO(BaseModel):
    id: str = Field(..., min_length=2, pattern="^[a-zA-Z0-9_]+$")
    slug: str = Field(..., min_length=2)
    name: dict

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, v: dict):
        if not v.get("vi") or len(v["vi"].strip()) == 0:
            raise ValueError("Tên hiển thị (Tiếng Việt) không được để trống")
        return v


class AISettingsDTO(BaseModel):
    chat_provider: str
    chat_model: str
    embedding_provider: str
    embedding_model: str
    google_client_id: str | None = None
    google_client_secret: str | None = None
    database_url: str | None = None
    system_prompt: str | None = None
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None


class PolicyUpdateDTO(BaseModel):
    content: str = Field(..., min_length=10)
    title: str | None = None
    locale: str = "vi"
    policy_type: str = "store"


class PolicyResponseDTO(BaseModel):
    id: str
    title: str | None
    content: str
    locale: str
    policy_type: str


class ModelTestRequestDTO(BaseModel):
    prompt: str = "Please introduce yourself as the store concierge in 2 short sentences."


class ModelTestResponseDTO(BaseModel):
    provider: str
    model: str
    prompt: str
    answer: str


class ProductDTO(BaseModel):
    id: str | None = None
    slug: str = Field(..., min_length=2)
    name: dict
    brand: str = "Htech"
    category: str = Field(..., min_length=1)
    tagline: dict = {}
    basePrice: int = Field(..., gt=0, alias="basePrice")
    is_trade_in: bool = False
    image: str = Field(..., min_length=1)
    gallery: list[str] = []
    description: dict
    details: dict = {}
    highlightSpecs: list[str] = Field(default_factory=list, alias="highlightSpecs")
    available: bool = True
    trending: bool = False
    isNew: bool = Field(default=False, alias="isNew")
    stock: int = 10
    rating: float = 5.0
    reviewCount: int = Field(default=0, alias="reviewCount")
    discountPercent: int = Field(default=0, alias="discountPercent")

    class Config:
        populate_by_name = True
        from_attributes = True

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, v: dict):
        if not v.get("vi") or len(v["vi"].strip()) == 0:
            raise ValueError("Tên sản phẩm không được để trống")
        return v


class PromoUpdateDTO(BaseModel):
    trending: bool | None = None
    discount: int | None = None


class StoreProfileDTO(BaseModel):
    name: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    bank_name: str = Field(..., min_length=1)
    bank_account: str = Field(..., min_length=1)
    bank_beneficiary: str = Field(..., min_length=1)
    facebook_link: str | None = None
    instagram_link: str | None = None


class OrderItemDTO(BaseModel):
    product_id: str
    name: str | None = None
    qty: int = Field(..., gt=0)
    price: int = Field(..., ge=0)
    # days removed for trade-in logic


class OrderDTO(BaseModel):
    id: str
    order_number: str
    customer: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)
    total: int
    deposit: int
    status: str
    expected_delivery: str
    payment_proof: str | None = None
    items: list[OrderItemDTO]


class OrderStatusUpdateDTO(BaseModel):
    status: str


from app.models.models import UserRole, UserPermission

class UserDTO(BaseModel):
    id: str | None = None
    email: str = Field(..., min_length=5)
    username: str | None = None
    password: str | None = None
    full_name: str | None = None
    role: UserRole
    permission: UserPermission


class LoginRequestDTO(BaseModel):
    identifier: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class RepairNoteDTO(BaseModel):
    id: str | None = None
    content: str = Field(..., min_length=1)
    created_at: str | None = None


class RepairDTO(BaseModel):
    id: str | None = None
    customer_name: str = Field(..., min_length=1)
    device_name: str = Field(..., min_length=1)
    issue: str = Field(..., min_length=1)
    status: str
    created_at: str | None = None
    notes: list[RepairNoteDTO] = []


class ThemePaletteDTO(BaseModel):
    id: str | None = None
    name: str = Field(..., min_length=1)
    is_preset: bool = False
    
    light_main: str
    light_sub: str
    light_accent: str
    
    dark_main: str
    dark_sub: str
    dark_accent: str


class ThemeSettingsResponseDTO(BaseModel):
    active_palette_id: str | None
    palettes: list[ThemePaletteDTO]


class StoreSettingsDTO(BaseModel):
    deposit_percentage: int


class TelegramTestDTO(BaseModel):
    token: str
    chat_id: str


class PromotionDTO(BaseModel):
    id: int | None = None
    code: str
    name: str
    type: str
    value: int
    min_order: int = 0
    max_discount: int = 0
    usage_limit: int = 100
    used_count: int = 0
    start_date: str
    end_date: str
    status: str = "active"
    applicable_products: str = "all"
    category: str | None = None

    class Config:
        from_attributes = True


class PromotionCreateDTO(BaseModel):
    code: str
    name: str
    type: str
    value: int
    min_order: int = 0
    max_discount: int = 0
    usage_limit: int = 100
    start_date: str
    end_date: str
    applicable_products: str = "all"
    category: str | None = None
