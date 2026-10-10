from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from src.core.constants import PaymentMethod, PaymentStatus


class StripePaymentIntentCreate(BaseModel):
    order_id: int


class StripePaymentIntentResponse(BaseModel):
    client_secret: str
    publishable_key: str
    amount: Decimal
    currency: str = "usd"


class PayPalOrderCreate(BaseModel):
    order_id: int


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    payment_method: PaymentMethod
    status: PaymentStatus
    amount: Decimal
    transaction_id: str | None = None

    model_config = ConfigDict(from_attributes=True)