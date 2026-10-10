from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.constants import UserRole
from src.core.exceptions import ForbiddenException, UnauthorizedException
from src.core.security import decode_token
from src.db.session import get_db
from src.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    db: Annotated[AsyncSession, Depends(get_db)],
    token: Annotated[str, Depends(reusable_oauth2)],
) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException(detail="Could not validate credentials")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException(detail="Could not validate credentials")

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if not user:
        raise UnauthorizedException(detail="User not found")
    if not user.is_active:
        raise UnauthorizedException(detail="Inactive user account")
    return user


async def get_current_vendor(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if current_user.role not in [UserRole.VENDOR, UserRole.ADMIN]:
        raise ForbiddenException(detail="Access forbidden: Requires vendor or admin account")
    return current_user


async def get_current_active_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise ForbiddenException(detail="The user does not have enough privileges")
    return current_user