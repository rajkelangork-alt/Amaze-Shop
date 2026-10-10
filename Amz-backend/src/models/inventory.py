from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from src.models.inventory_transaction import InventoryTransaction
    from src.models.product_variant import ProductVariant


class Inventory(Base, TimestampMixin):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id", ondelete="CASCADE"), unique=True, nullable=False)
    quantity_available: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    quantity_reserved: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="inventory")
    transactions: Mapped[list["InventoryTransaction"]] = relationship("InventoryTransaction", back_populates="inventory", cascade="all, delete-orphan")