from sqlalchemy.ext.asyncio import AsyncSession

from src.core.constants import InventoryTransactionType
from src.core.exceptions import NotFoundException
from src.repositories.inventory_repository import InventoryRepository


class InventoryService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.inv_repo = InventoryRepository(session)

    async def update_stock(
        self,
        variant_id: int,
        delta: int,
        tx_type: InventoryTransactionType = InventoryTransactionType.RESTOCK,
    ) -> int:
        inv = await self.inv_repo.adjust_stock(variant_id, delta, tx_type)
        if not inv:
            raise NotFoundException(detail="Inventory record not found")
        await self.session.commit()
        return inv.quantity_available