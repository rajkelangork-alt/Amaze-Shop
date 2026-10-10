from sqlalchemy.ext.asyncio import AsyncSession

from src.core.constants import UserRole
from src.core.exceptions import BadRequestException, UnauthorizedException
from src.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from src.repositories.user_repository import UserRepository
from src.schemas.user import TokenResponse, UserCreate


class AuthService:
    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    async def signup(self, user_in: UserCreate) -> TokenResponse:
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise BadRequestException(detail="Email is already registered")

        user = await self.user_repo.create({
            "email": user_in.email,
            "hashed_password": get_password_hash(user_in.password),
            "first_name": user_in.first_name,
            "last_name": user_in.last_name,
            "role": UserRole.CUSTOMER,
            "is_active": True,
            "is_verified": False,
        })

        access = create_access_token(user.id)
        refresh = create_refresh_token(user.id)
        return TokenResponse(access_token=access, refresh_token=refresh)

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedException(detail="Incorrect email or password")
        if not user.is_active:
            raise UnauthorizedException(detail="Account is inactive")

        access = create_access_token(user.id)
        refresh = create_refresh_token(user.id)
        return TokenResponse(access_token=access, refresh_token=refresh)

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException(detail="Invalid refresh token")

        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException(detail="Invalid refresh token")

        user = await self.user_repo.get_by_id(int(user_id))
        if not user or not user.is_active:
            raise UnauthorizedException(detail="User inactive or not found")

        access = create_access_token(user.id)
        refresh = create_refresh_token(user.id)
        return TokenResponse(access_token=access, refresh_token=refresh)