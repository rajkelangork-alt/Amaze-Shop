from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.constants import PaymentMethod
from src.db.session import get_db
from src.models.user import User
from src.schemas.payment import (
    PaymentResponse,
    StripePaymentIntentCreate,
    StripePaymentIntentResponse,
)
from src.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post(
    "/create-intent",
    response_model=StripePaymentIntentResponse,
    status_code=status.HTTP_200_OK,
    summary="Create Stripe payment intent for an order",
)
async def create_stripe_payment_intent(
    payload: StripePaymentIntentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> StripePaymentIntentResponse:
    service = PaymentService(db)
    return await service.create_stripe_intent(payload.order_id, current_user.id)


@router.post(
    "/confirm",
    response_model=PaymentResponse,
    status_code=status.HTTP_200_OK,
    summary="Record confirmed payment",
)
async def confirm_payment(
    order_id: int,
    amount: Decimal,
    method: PaymentMethod,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    tx_id: str | None = Query(None),
) -> PaymentResponse:
    service = PaymentService(db)
    return await service.record_payment(order_id, method, amount, tx_id)