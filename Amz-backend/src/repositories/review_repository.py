from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.review import Review
from src.repositories.base_repository import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    def __init__(self, session: AsyncSession):
        super().__init__(Review, session)

    async def create_review(
        self,
        user_id: int,
        product_id: int,
        rating: int,
        comment: str | None = None,
        title: str | None = None,
    ) -> Review:
        review = Review(
            user_id=user_id,
            product_id=product_id,
            rating=rating,
            comment=comment,
            title=title,
        )
        self.session.add(review)
        await self.session.commit()
        await self.session.refresh(review)
        return review

    async def get_product_reviews(
        self, product_id: int, skip: int = 0, limit: int = 20
    ) -> list[Review]:
        query = (
            select(Review)
            .where(Review.product_id == product_id)
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())