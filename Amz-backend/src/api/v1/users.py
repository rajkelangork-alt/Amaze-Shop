from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.db.session import get_db
from src.models.user import User
from src.schemas.user import AddressCreate, AddressResponse, UserResponse
from src.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    service = UserService(db)
    return await service.get_profile(current_user)


@router.get(
    "/me/addresses",
    response_model=list[AddressResponse],
    status_code=status.HTTP_200_OK,
    summary="List addresses for current user",
)
async def get_addresses(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[AddressResponse]:
    service = UserService(db)
    return await service.get_addresses(current_user.id)


@router.post(
    "/me/addresses",
    response_model=AddressResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new shipping address",
)
async def create_address(
    payload: AddressCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AddressResponse:
    service = UserService(db)
    return await service.add_address(current_user.id, payload)