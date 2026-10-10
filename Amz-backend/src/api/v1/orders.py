from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.db.session import get_db
from src.models.user import User
from src.schemas.order import OrderCreate, OrderDetailResponse, OrderSummaryResponse
from src.services.checkout_service import CheckoutService
from src.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get(
    "/checkout/preview",
    status_code=status.HTTP_200_OK,
    summary="Calculate checkout pricing and order totals",
)
async def preview_checkout(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    service = CheckoutService(db)
    return await service.preview_checkout(current_user.id)


@router.post(
    "",
    response_model=OrderDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Place order from user cart",
)
async def create_order(
    payload: OrderCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OrderDetailResponse:
    service = OrderService(db)
    return await service.create_order_from_cart(current_user.id, payload)


@router.get(
    "",
    response_model=list[OrderSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="List past orders for current user",
)
async def list_orders(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[OrderSummaryResponse]:
    service = OrderService(db)
    return await service.get_user_orders(current_user.id, skip=skip, limit=limit)