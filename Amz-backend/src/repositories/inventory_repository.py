from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.constants import InventoryTransactionType
from src.models.inventory import Inventory
from src.models.inventory_transaction import InventoryTransaction
from src.repositories.base_repository import BaseRepository


class InventoryRepository(BaseRepository[Inventory]):
    def __init__(self, session: AsyncSession):
        super().__init__(Inventory, session)

    async def get_by_variant_id(self, variant_id: int) -> Inventory | None:
        result = await self.session.execute(
            select(Inventory).where(Inventory.variant_id == variant_id)
        )
        return result.scalars().first()

    async def adjust_stock(
        self,
        variant_id: int,
        quantity_delta: int,
        tx_type: InventoryTransactionType,
        ref_id: str | None = None,
    ) -> Inventory | None:
        inv = await self.get_by_variant_id(variant_id)
        if not inv:
            return None

        inv.quantity_available += quantity_delta
        transaction = InventoryTransaction(
            inventory_id=inv.id,
            change_quantity=quantity_delta,
            transaction_type=tx_type,
            reference_id=ref_id,
        )
        self.session.add(transaction)
        await self.session.flush()
        return inv