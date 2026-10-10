from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.constants import PaymentMethod, PaymentStatus
from src.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from src.models.order import Order
    from src.models.refund import Refund


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, name="payment_method"),
        nullable=False
    )
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status"),
        default=PaymentStatus.PENDING,
        nullable=False
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    transaction_id: Mapped[str | None] = mapped_column(String(200), unique=True, nullable=True)

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="payment")
    refunds: Mapped[list["Refund"]] = relationship("Refund", back_populates="payment", cascade="all, delete-orphan")