from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.constants import InventoryTransactionType
from src.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from src.models.inventory import Inventory


class InventoryTransaction(Base, TimestampMixin):
    __tablename__ = "inventory_transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    inventory_id: Mapped[int] = mapped_column(ForeignKey("inventory.id", ondelete="CASCADE"), nullable=False)
    change_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    transaction_type: Mapped[InventoryTransactionType] = mapped_column(
        Enum(InventoryTransactionType, name="inventory_tx_type"),
        nullable=False
    )
    reference_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Relationship
    inventory: Mapped["Inventory"] = relationship("Inventory", back_populates="transactions")