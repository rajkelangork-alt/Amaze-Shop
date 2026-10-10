from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.db.session import get_db
from src.models.user import User
from src.services.checkout_service import CheckoutService

router = APIRouter(prefix="/checkout", tags=["Checkout"])


@router.get(
    "/preview",
    status_code=status.HTTP_200_OK,
    summary="Preview current checkout totals",
)
async def preview_checkout(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    service = CheckoutService(db)
    return await service.preview_checkout(current_user.id)