from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_active_admin
from src.core.constants import InventoryTransactionType
from src.db.session import get_db
from src.models.user import User
from src.schemas.analytics import AnalyticsOverview
from src.services.analytics_service import AnalyticsService
from src.services.inventory_service import InventoryService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get(
    "/analytics/overview",
    response_model=AnalyticsOverview,
    status_code=status.HTTP_200_OK,
    summary="Admin KPI overview",
)
async def get_analytics_overview(
    _: Annotated[User, Depends(get_current_active_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AnalyticsOverview:
    service = AnalyticsService(db)
    return await service.get_overview()


@router.post(
    "/inventory/{variant_id}/restock",
    status_code=status.HTTP_200_OK,
    summary="Restock variant inventory",
)
async def restock_variant(
    variant_id: int,
    quantity: Annotated[int, Query(gt=0, description="Quantity to add")],
    _: Annotated[User, Depends(get_current_active_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, int]:
    service = InventoryService(db)
    new_stock = await service.update_stock(
        variant_id=variant_id,
        delta=quantity,
        tx_type=InventoryTransactionType.RESTOCK,
    )
    return {"variant_id": variant_id, "quantity_available": new_stock}