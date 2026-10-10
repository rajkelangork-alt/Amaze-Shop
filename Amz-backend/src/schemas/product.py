from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from src.schemas.category import CategoryResponse


class ProductListItem(BaseModel):
    id: int
    name: str
    slug: str
    base_price: Decimal = Field(..., max_digits=10, decimal_places=2, examples=[Decimal("29.99")])
    is_featured: bool
    category_id: int
    primary_image: str | None = None

    model_config = {"from_attributes": True}
    
class ProductImageResponse(BaseModel):
    id: int
    url: str
    alt_text: str | None = None
    is_primary: bool
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class ProductVariantResponse(BaseModel):
    id: int
    sku: str
    title: str
    price: Decimal
    is_default: bool
    stock_available: int = 0

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str
    slug: str
    description: str
    base_price: Decimal
    is_active: bool = True
    is_featured: bool = False
    category_id: int
    brand_id: int | None = None


class ProductCreate(ProductBase):
    pass


class ProductCardResponse(BaseModel):
    id: int
    name: str
    slug: str
    base_price: Decimal
    is_featured: bool
    category_id: int
    primary_image: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ProductDetailResponse(ProductBase):
    id: int
    category: CategoryResponse
    images: list[ProductImageResponse] = []
    variants: list[ProductVariantResponse] = []
    average_rating: float = 0.0
    reviews_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)