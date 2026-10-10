from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.schemas.common import PaginatedResponse
from src.schemas.product import ProductCardResponse, ProductDetailResponse
from src.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get(
    "",
    response_model=PaginatedResponse[ProductCardResponse],
    status_code=status.HTTP_200_OK,
    summary="Filter catalog products",
)
async def list_products(
    db: Annotated[AsyncSession, Depends(get_db)],
    category_id: Annotated[int | None, Query(description="Category filter ID")] = None,
    min_price: Annotated[Decimal | None, Query(ge=0, description="Minimum price filter")] = None,
    max_price: Annotated[Decimal | None, Query(ge=0, description="Maximum price filter")] = None,
    q: Annotated[str | None, Query(description="Search query string")] = None,
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
    limit: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
) -> PaginatedResponse[ProductCardResponse]:
    service = ProductService(db)
    return await service.get_products_catalog(
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        search_query=q,
        page=page,
        limit=limit,
    )


@router.get(
    "/{slug}",
    response_model=ProductDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get detailed product by slug",
)
async def get_product_detail(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ProductDetailResponse:
    service = ProductService(db)
    return await service.get_product_by_slug(slug)