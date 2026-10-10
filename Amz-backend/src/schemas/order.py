from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

from src.core.constants import OrderStatus, PaymentMethod


class OrderItemResponse(BaseModel):
    id: int
    variant_id: int
    quantity: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


class OrderSummaryResponse(BaseModel):
    id: int
    order_number: str
    status: OrderStatus
    total_amount: Decimal
    items_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderDetailResponse(BaseModel):
    id: int
    order_number: str
    status: OrderStatus
    total_amount: Decimal
    shipping_fee: Decimal
    tax_amount: Decimal
    tracking_number: str | None = None
    items: list[OrderItemResponse] = Field(default_factory=list)
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    shipping_address_id: int | None = None
    payment_method: PaymentMethod = PaymentMethod.STRIPE
    notes: str | None = None

    @field_validator("payment_method", mode="before")
    @classmethod
    def normalize_payment_method(cls, v: str | PaymentMethod) -> str | PaymentMethod:
        if isinstance(v, str):
            return v.lower()
        return v


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    tracking_number: str | None = None