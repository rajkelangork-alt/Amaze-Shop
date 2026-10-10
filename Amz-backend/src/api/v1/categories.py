from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.schemas.category import CategoryResponse
from src.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get(
    "",
    response_model=list[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="List all product categories",
)
async def list_categories(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[CategoryResponse]:
    service = CategoryService(db)
    return await service.list_all_categories()


@router.get(
    "/{slug}",
    response_model=CategoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get category by slug",
)
async def get_category(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CategoryResponse:
    service = CategoryService(db)
    return await service.get_by_slug(slug)