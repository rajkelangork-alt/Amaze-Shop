from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.address import Address
from src.models.user import User
from src.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_addresses(self, user_id: int) -> list[Address]:
        result = await self.session.execute(select(Address).where(Address.user_id == user_id))
        return list(result.scalars().all())

    async def add_address(self, user_id: int, address_data: dict) -> Address:
        address = Address(user_id=user_id, **address_data)
        self.session.add(address)
        await self.session.flush()
        return address