from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.schemas.common import PaginatedResponse
from src.schemas.product import ProductCardResponse
from src.services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["Search"])


@router.get(
    "",
    response_model=PaginatedResponse[ProductCardResponse],
    status_code=status.HTTP_200_OK,
    summary="Full-text product search",
)
async def search_products(
    q: Annotated[str, Query(min_length=1, description="Search query keyword")],
    db: Annotated[AsyncSession, Depends(get_db)],
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
    limit: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
) -> PaginatedResponse[ProductCardResponse]:
    service = SearchService(db)
    return await service.search_catalog(query=q, page=page, limit=limit)