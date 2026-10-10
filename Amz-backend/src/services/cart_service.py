from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.inspection import inspect

from src.core.exceptions import InsufficientStockException, NotFoundException
from src.repositories.cart_repository import CartRepository
from src.repositories.inventory_repository import InventoryRepository
from src.repositories.product_repository import ProductRepository
from src.schemas.cart import CartItemResponse, CartResponse


class CartService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.cart_repo = CartRepository(session)
        self.product_repo = ProductRepository(session)
        self.inv_repo = InventoryRepository(session)

    async def get_user_cart(self, user_id: int) -> CartResponse:
        cart = await self.cart_repo.get_or_create_user_cart(user_id)
        return self._build_cart_response(cart)

    # Alias to keep compatibility with any caller using get_cart
    get_cart = get_user_cart

    async def add_item_to_cart(self, user_id: int, variant_id: int, quantity: int) -> CartResponse:
        variant = await self.product_repo.get_variant_by_id(variant_id)
        if not variant:
            raise NotFoundException(detail="Variant not found")

        inv = await self.inv_repo.get_by_variant_id(variant_id)
        if not inv or inv.quantity_available < quantity:
            raise InsufficientStockException(detail="Insufficient inventory for requested quantity")

        cart = await self.cart_repo.get_or_create_user_cart(user_id)
        await self.cart_repo.add_or_update_item(cart.id, variant_id, quantity)
        await self.session.commit()

        fresh_cart = await self.cart_repo.get_or_create_user_cart(user_id)
        return self._build_cart_response(fresh_cart)

    async def remove_cart_item(self, user_id: int, item_id: int) -> CartResponse:
        cart = await self.cart_repo.get_or_create_user_cart(user_id)
        for item in cart.items:
            if item.id == item_id:
                await self.session.delete(item)
                await self.session.commit()
                break
        fresh_cart = await self.cart_repo.get_or_create_user_cart(user_id)
        return self._build_cart_response(fresh_cart)

    def _build_cart_response(self, cart) -> CartResponse:
        items: list[CartItemResponse] = []
        subtotal = Decimal("0.00")

        for item in cart.items:
            variant = item.variant
            prod = variant.product if variant else None
            unit_price = Decimal(str(variant.price)) if (variant and variant.price is not None) else Decimal("0.00")
            item_subtotal = unit_price * item.quantity
            subtotal += item_subtotal

            image_url: str | None = None
            if prod is not None:
                state = inspect(prod)
                if "images" not in state.unloaded and prod.images:
                    image_url = prod.images[0].url

            items.append(
                CartItemResponse(
                    id=item.id,
                    variant_id=item.variant_id,
                    product_name=prod.name if prod else "Product",
                    variant_title=variant.title if variant else "Default",
                    sku=variant.sku if variant else "",
                    quantity=item.quantity,
                    unit_price=unit_price,
                    subtotal=item_subtotal,
                    image_url=image_url,
                )
            )

        shipping_fee = Decimal("10.00") if (subtotal > 0 and subtotal < Decimal("100.00")) else Decimal("0.00")
        total_amount = subtotal + shipping_fee

        return CartResponse(
            id=cart.id,
            user_id=cart.user_id,
            items=items,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            total_amount=total_amount,
        )

