from collections.abc import Sequence
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.product import Product
from src.models.product_variant import ProductVariant
from src.repositories.base_repository import BaseRepository


class ProductRepository(BaseRepository[Product]):
    def __init__(self, session: AsyncSession):
        super().__init__(Product, session)

    async def get_detail_by_id(self, product_id: int) -> Product | None:
        query = (
            select(Product)
            .options(
                selectinload(Product.category),
                selectinload(Product.images),
                selectinload(Product.variants).selectinload(ProductVariant.inventory),
            )
            .where(Product.id == product_id, Product.is_active.is_(True))
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_detail_by_slug(self, slug: str) -> Product | None:
        query = (
            select(Product)
            .options(
                selectinload(Product.category),
                selectinload(Product.images),
                selectinload(Product.variants).selectinload(ProductVariant.inventory),
            )
            .where(Product.slug == slug, Product.is_active.is_(True))
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def filter_products(
        self,
        category_id: int | None = None,
        min_price: Decimal | None = None,
        max_price: Decimal | None = None,
        search_query: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Product], int]:
        query = (
            select(Product)
            .options(selectinload(Product.images))
            .where(Product.is_active.is_(True))
        )
        count_query = select(func.count(Product.id)).where(Product.is_active.is_(True))

        if category_id:
            query = query.where(Product.category_id == category_id)
            count_query = count_query.where(Product.category_id == category_id)
        if min_price is not None:
            query = query.where(Product.base_price >= min_price)
            count_query = count_query.where(Product.base_price >= min_price)
        if max_price is not None:
            query = query.where(Product.base_price <= max_price)
            count_query = count_query.where(Product.base_price <= max_price)
        if search_query:
            pattern = f"%{search_query}%"
            query = query.where(Product.name.ilike(pattern) | Product.description.ilike(pattern))
            count_query = count_query.where(Product.name.ilike(pattern) | Product.description.ilike(pattern))

        total = (await self.session.execute(count_query)).scalar() or 0
        items = (await self.session.execute(query.offset(skip).limit(limit))).scalars().all()
        return items, total

    async def get_variant_by_id(self, variant_id: int) -> ProductVariant | None:
        result = await self.session.execute(
            select(ProductVariant)
            .options(selectinload(ProductVariant.inventory), selectinload(ProductVariant.product))
            .where(ProductVariant.id == variant_id)
        )
        return result.scalars().first()