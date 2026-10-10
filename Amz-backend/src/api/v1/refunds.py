from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_active_admin
from src.db.session import get_db
from src.models.user import User
from src.schemas.refund import RefundCreate, RefundResponse
from src.services.refund_service import RefundService

router = APIRouter(prefix="/refunds", tags=["Refunds"])


@router.post(
    "",
    response_model=RefundResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Request a payment refund",
)
async def process_refund(
    payload: RefundCreate,
    _: Annotated[User, Depends(get_current_active_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RefundResponse:
    service = RefundService(db)
    return await service.request_refund(payload)