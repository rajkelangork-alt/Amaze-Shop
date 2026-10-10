from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_active_admin
from src.core.constants import InventoryTransactionType
from src.db.session import get_db
from src.models.user import User
from src.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.post(
    "/{variant_id}/adjust",
    status_code=status.HTTP_200_OK,
    summary="Adjust variant stock level",
)
async def adjust_stock(
    variant_id: int,
    quantity_delta: Annotated[int, Query(description="Stock delta (positive or negative)")],
    _: Annotated[User, Depends(get_current_active_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, int]:
    service = InventoryService(db)
    tx_type = InventoryTransactionType.RESTOCK if quantity_delta > 0 else InventoryTransactionType.ADJUSTMENT
    new_stock = await service.update_stock(
        variant_id=variant_id,
        delta=quantity_delta,
        tx_type=tx_type,
    )
    return {"variant_id": variant_id, "quantity_available": new_stock}