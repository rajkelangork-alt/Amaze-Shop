from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import NotFoundException
from src.repositories.product_repository import ProductRepository
from src.schemas.common import PaginatedResponse
from src.schemas.product import (
    ProductCardResponse,
    ProductDetailResponse,
    ProductImageResponse,
    ProductVariantResponse,
)


class ProductService:
    def __init__(self, session: AsyncSession):
        self.product_repo = ProductRepository(session)

    async def get_products_catalog(
        self,
        category_id: int | None = None,
        min_price: Decimal | None = None,
        max_price: Decimal | None = None,
        search_query: str | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedResponse[ProductCardResponse]:
        skip = (page - 1) * limit
        products, total = await self.product_repo.filter_products(
            category_id=category_id,
            min_price=min_price,
            max_price=max_price,
            search_query=search_query,
            skip=skip,
            limit=limit,
        )
        items = [
            ProductCardResponse(
                id=p.id,
                name=p.name,
                slug=p.slug,
                base_price=Decimal(str(p.base_price)),
                is_featured=p.is_featured,
                category_id=p.category_id,
                primary_image = p.images[0].url if (p.images and len(p.images) > 0) else None
            )
            for p in products
        ]
        pages = (total + limit - 1) // limit if total > 0 else 1
        return PaginatedResponse(items=items, total=total, page=page, pages=pages, limit=limit)

    async def get_product_by_slug(self, slug: str) -> ProductDetailResponse:
        product = await self.product_repo.get_detail_by_slug(slug)
        if not product:
            raise NotFoundException(detail="Product not found")

        variants = [
            ProductVariantResponse(
                id=v.id,
                sku=v.sku,
                title=v.title,
                price=Decimal(str(v.price)),
                is_default=v.is_default,
                stock_available=v.inventory.quantity_available if v.inventory else 0,
            )
            for v in product.variants
        ]
        images = [
            ProductImageResponse(
                id=img.id,
                url=img.url,
                alt_text=img.alt_text,
                is_primary=img.is_primary,
                display_order=img.display_order,
            )
            for img in product.images
        ]

        return ProductDetailResponse(
            id=product.id,
            name=product.name,
            slug=product.slug,
            description=product.description,
            base_price=Decimal(str(product.base_price)),
            is_active=product.is_active,
            is_featured=product.is_featured,
            category_id=product.category_id,
            brand_id=product.brand_id,
            category=product.category,  # type: ignore
            images=images,
            variants=variants,
            average_rating=4.5,
            reviews_count=12,
            created_at=product.created_at,
        )