from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import NotFoundException
from src.repositories.product_repository import ProductRepository
from src.repositories.review_repository import ReviewRepository
from src.schemas.review import ReviewCreate, ReviewResponse


class ReviewService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.review_repo = ReviewRepository(session)
        self.product_repo = ProductRepository(session)

    async def add_review(self, user_id: int, product_id: int, payload: ReviewCreate) -> ReviewResponse:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException(detail="Product not found")

        review = await self.review_repo.create_review(
            user_id=user_id,
            product_id=product_id,
            rating=payload.rating,
            comment=payload.comment,
            title=payload.title,
        )
        return ReviewResponse.model_validate(review)

    async def get_reviews(self, product_id: int, skip: int = 0, limit: int = 20) -> list[ReviewResponse]:
        reviews = await self.review_repo.get_product_reviews(product_id, skip=skip, limit=limit)
        return [ReviewResponse.model_validate(r) for r in reviews]