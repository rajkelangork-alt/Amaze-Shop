from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user import User
from src.repositories.user_repository import UserRepository
from src.schemas.user import AddressCreate, AddressResponse, UserResponse


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)

    async def get_profile(self, user: User) -> UserResponse:
        return UserResponse.model_validate(user)

    async def get_addresses(self, user_id: int) -> list[AddressResponse]:
        addresses = await self.user_repo.get_addresses(user_id)
        return [AddressResponse.model_validate(a) for a in addresses]

    async def add_address(self, user_id: int, payload: AddressCreate) -> AddressResponse:
        address = await self.user_repo.add_address(user_id, payload.model_dump())
        await self.session.commit()
        return AddressResponse.model_validate(address)