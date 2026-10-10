import uuid
from collections.abc import Sequence
from decimal import Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.constants import OrderStatus
from src.core.exceptions import NotFoundException
from src.models.order import Order
from src.models.order_item import OrderItem
from src.repositories.base_repository import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self, session: AsyncSession):
        super().__init__(Order, session)

    async def create_order(
        self,
        user_id: int,
        total_amount: Decimal,
        shipping_fee: Decimal,
        tax_amount: Decimal,
        items_data: list[dict[str, Any]],
    ) -> Order:
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        order = Order(
            user_id=user_id,
            order_number=order_number,
            status=OrderStatus.PENDING,
            total_amount=total_amount,
            shipping_fee=shipping_fee,
            tax_amount=tax_amount,
        )
        self.session.add(order)
        await self.session.flush()

        for item in items_data:
            order_item = OrderItem(
                order_id=order.id,
                variant_id=item["variant_id"],
                quantity=item["quantity"],
                unit_price=item["unit_price"],
            )
            self.session.add(order_item)

        await self.session.flush()

        result = await self.session.execute(
            select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
        )
        created = result.scalars().first()
        if not created:
            raise NotFoundException(detail="Created order could not be retrieved")
        return created

    async def get_user_orders(
        self, user_id: int, skip: int = 0, limit: int = 20
    ) -> tuple[Sequence[Order], int]:
        query = (
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
        )
        count_query = select(func.count(Order.id)).where(Order.user_id == user_id)

        total = (await self.session.execute(count_query)).scalar() or 0
        items = (await self.session.execute(query.offset(skip).limit(limit))).scalars().all()
        return items, total