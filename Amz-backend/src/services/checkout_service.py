from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import BadRequestException
from src.repositories.cart_repository import CartRepository


class CheckoutService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.cart_repo = CartRepository(session)

    async def preview_checkout(self, user_id: int) -> dict:
        cart = await self.cart_repo.get_or_create_user_cart(user_id)
        if not cart.items:
            raise BadRequestException(detail="Cart is empty")

        subtotal = Decimal("0.00")
        for item in cart.items:
            subtotal += Decimal(str(item.variant.price)) * item.quantity

        shipping_fee = Decimal("10.00") if subtotal < Decimal("100.00") else Decimal("0.00")
        tax = (subtotal * Decimal("0.05")).quantize(Decimal("0.01"))
        total = subtotal + shipping_fee + tax

        return {
            "items_count": len(cart.items),
            "subtotal": subtotal,
            "shipping_fee": shipping_fee,
            "tax_amount": tax,
            "total_amount": total,
        }