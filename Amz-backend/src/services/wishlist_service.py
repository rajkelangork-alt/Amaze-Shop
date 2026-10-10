from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.wishlist import Wishlist


class WishlistService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_wishlist(self, user_id: int) -> list[int]:
        query = select(Wishlist).where(Wishlist.user_id == user_id)
        items = (await self.session.execute(query)).scalars().all()
        return [item.product_id for item in items]

    async def toggle_item(self, user_id: int, product_id: int) -> bool:
        query = select(Wishlist).where(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
        existing = (await self.session.execute(query)).scalars().first()
        if existing:
            await self.session.delete(existing)
            await self.session.commit()
            return False
        new_item = Wishlist(user_id=user_id, product_id=product_id)
        self.session.add(new_item)
        await self.session.commit()
        return True