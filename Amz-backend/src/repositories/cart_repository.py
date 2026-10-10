from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.exceptions import NotFoundException
from src.models.cart import Cart, CartItem
from src.models.product import Product
from src.models.product_variant import ProductVariant
from src.repositories.base_repository import BaseRepository


class CartRepository(BaseRepository[Cart]):
    def __init__(self, session: AsyncSession):
        super().__init__(Cart, session)

    async def get_or_create_user_cart(self, user_id: int) -> Cart:
        query = (
            select(Cart)
            .options(
                selectinload(Cart.items)
                .selectinload(CartItem.variant)
                .selectinload(ProductVariant.product)
                .selectinload(Product.images)
            )
            .where(Cart.user_id == user_id)
        )
        result = await self.session.execute(query)
        cart = result.scalars().first()

        if not cart:
            cart = Cart(user_id=user_id)
            self.session.add(cart)
            await self.session.commit()
            result = await self.session.execute(query)
            cart = result.scalars().first()

        if not cart:
            raise NotFoundException(detail="Cart could not be retrieved")

        return cart

    async def get_cart_item(self, cart_id: int, variant_id: int) -> CartItem | None:
        query = select(CartItem).where(
            CartItem.cart_id == cart_id,
            CartItem.variant_id == variant_id,
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def add_or_update_item(self, cart_id: int, variant_id: int, quantity: int) -> CartItem:
        item = await self.get_cart_item(cart_id, variant_id)
        if item:
            item.quantity += quantity
        else:
            item = CartItem(cart_id=cart_id, variant_id=variant_id, quantity=quantity)
            self.session.add(item)
        await self.session.flush()
        return item

    async def clear_cart(self, cart_id: int) -> None:
        cart_items_query = select(CartItem).where(CartItem.cart_id == cart_id)
        items = (await self.session.execute(cart_items_query)).scalars().all()
        for item in items:
            await self.session.delete(item)
        await self.session.flush()