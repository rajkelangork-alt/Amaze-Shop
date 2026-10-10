from sqlalchemy.ext.asyncio import AsyncSession

from src.schemas.common import PaginatedResponse
from src.schemas.product import ProductCardResponse
from src.services.product_service import ProductService


class SearchService:
    def __init__(self, session: AsyncSession):
        self.prod_service = ProductService(session)

    async def search_catalog(self, query: str, page: int = 1, limit: int = 20) -> PaginatedResponse[ProductCardResponse]:
        return await self.prod_service.get_products_catalog(search_query=query, page=page, limit=limit)