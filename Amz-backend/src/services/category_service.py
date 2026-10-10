from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import NotFoundException
from src.repositories.category_repository import CategoryRepository
from src.schemas.category import CategoryResponse


class CategoryService:
    def __init__(self, session: AsyncSession):
        self.category_repo = CategoryRepository(session)

    async def list_all_categories(self) -> list[CategoryResponse]:
        categories = await self.category_repo.get_all_categories()
        return [CategoryResponse.model_validate(c) for c in categories]

    async def get_by_slug(self, slug: str) -> CategoryResponse:
        cat = await self.category_repo.get_by_slug(slug)
        if not cat:
            raise NotFoundException(detail="Category not found")
        return CategoryResponse.model_validate(cat)