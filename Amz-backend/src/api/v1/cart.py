from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.db.session import get_db
from src.models.user import User
from src.schemas.cart import CartItemAdd, CartResponse
from src.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get(
    "",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user cart",
)
async def get_cart(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CartResponse:
    service = CartService(db)
    return await service.get_user_cart(current_user.id)


@router.post(
    "/items",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Add an item variant to cart",
)
async def add_item_to_cart(
    payload: CartItemAdd,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CartResponse:
    service = CartService(db)
    return await service.add_item_to_cart(
        user_id=current_user.id,
        variant_id=payload.variant_id,
        quantity=payload.quantity,
    )


@router.delete(
    "/items/{item_id}",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Remove an item from cart",
)
async def remove_item_from_cart(
    item_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CartResponse:
    service = CartService(db)
    return await service.remove_item_from_cart(current_user.id, item_id)