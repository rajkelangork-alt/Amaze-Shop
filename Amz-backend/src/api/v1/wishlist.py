from typing import Annotated, Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.db.session import get_db
from src.models.user import User
from src.services.wishlist_service import WishlistService

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get(
    "",
    response_model=list[int],
    status_code=status.HTTP_200_OK,
    summary="List product IDs in current user wishlist",
)
async def get_wishlist(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[int]:
    service = WishlistService(db)
    return await service.get_user_wishlist(current_user.id)


@router.post(
    "/toggle/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Add or remove item from wishlist",
)
async def toggle_wishlist_item(
    product_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, Any]:
    service = WishlistService(db)
    is_added = await service.toggle_item(current_user.id, product_id)
    return {"product_id": product_id, "is_in_wishlist": is_added}