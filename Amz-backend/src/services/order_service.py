from decimal import Decimal
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.constants import InventoryTransactionType
from src.core.exceptions import BadRequestException, InsufficientStockException
from src.repositories.cart_repository import CartRepository
from src.repositories.inventory_repository import InventoryRepository
from src.repositories.order_repository import OrderRepository
from src.schemas.order import (
    OrderCreate,
    OrderDetailResponse,
    OrderItemResponse,
    OrderSummaryResponse,
)


class OrderService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.order_repo = OrderRepository(session)
        self.cart_repo = CartRepository(session)
        self.inv_repo = InventoryRepository(session)

    async def create_order_from_cart(self, user_id: int, payload: OrderCreate) -> OrderDetailResponse:
        cart = await self.cart_repo.get_or_create_user_cart(user_id)
        if not cart.items:
            raise BadRequestException(detail="Cart is empty")

        items_data: list[dict[str, Any]] = []
        subtotal = Decimal("0.00")

        for cart_item in cart.items:
            variant = cart_item.variant
            inv = await self.inv_repo.get_by_variant_id(variant.id)
            if not inv or inv.quantity_available < cart_item.quantity:
                raise InsufficientStockException(
                    detail=f"Item {variant.title if variant else 'variant'} exceeds available stock"
                )

            unit_price = Decimal(str(variant.price))
            subtotal += unit_price * cart_item.quantity
            items_data.append({
                "variant_id": int(variant.id),
                "quantity": int(cart_item.quantity),
                "unit_price": unit_price,
            })

        shipping_fee = Decimal("10.00") if subtotal < Decimal("100.00") else Decimal("0.00")
        tax_amount = (subtotal * Decimal("0.05")).quantize(Decimal("0.01"))
        total = subtotal + shipping_fee + tax_amount

        # Note: Do not pass shipping_address_id here since Order table has no such column
        order = await self.order_repo.create_order(
            user_id=user_id,
            total_amount=total,
            shipping_fee=shipping_fee,
            tax_amount=tax_amount,
            items_data=items_data,
        )

        for item_info in items_data:
            await self.inv_repo.adjust_stock(
                variant_id=int(item_info["variant_id"]),
                quantity_delta=-int(item_info["quantity"]),
                tx_type=InventoryTransactionType.PURCHASE,
                ref_id=order.order_number,
            )

        await self.cart_repo.clear_cart(cart.id)
        await self.session.commit()

        items_out = [
            OrderItemResponse(
                id=db_item.id,
                variant_id=db_item.variant_id,
                quantity=db_item.quantity,
                unit_price=Decimal(str(db_item.unit_price)),
            )
            for db_item in order.items
        ]

        return OrderDetailResponse(
            id=order.id,
            order_number=order.order_number,
            status=order.status,
            total_amount=Decimal(str(order.total_amount)),
            shipping_fee=Decimal(str(order.shipping_fee)),
            tax_amount=Decimal(str(order.tax_amount)),
            tracking_number=order.tracking_number,
            items=items_out,
            created_at=order.created_at,
        )

    async def get_user_orders(self, user_id: int, skip: int = 0, limit: int = 20) -> list[OrderSummaryResponse]:
        orders, _ = await self.order_repo.get_user_orders(user_id, skip=skip, limit=limit)
        return [
            OrderSummaryResponse(
                id=o.id,
                order_number=o.order_number,
                status=o.status,
                total_amount=Decimal(str(o.total_amount)),
                items_count=len(o.items),
                created_at=o.created_at,
            )
            for o in orders
        ]