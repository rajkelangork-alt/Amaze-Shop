from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CartItemAdd(BaseModel):
    variant_id: int
    quantity: int = Field(1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: int
    variant_id: int
    product_name: str
    variant_title: str
    sku: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CartResponse(BaseModel):
    id: int
    user_id: int | None = None
    items: list[CartItemResponse] = []
    subtotal: Decimal = Decimal("0.00")
    shipping_fee: Decimal = Decimal("0.00")
    total_amount: Decimal = Decimal("0.00")

    model_config = ConfigDict(from_attributes=True)