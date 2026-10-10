from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.db.session import get_db
from src.models.user import User
from src.schemas.review import ReviewCreate, ReviewResponse
from src.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get(
    "/product/{product_id}",
    response_model=list[ReviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Get reviews for a product",
)
async def get_reviews(
    product_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[ReviewResponse]:
    service = ReviewService(db)
    return await service.get_product_reviews(product_id, skip=skip, limit=limit)


@router.post(
    "/product/{product_id}",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a product review",
)
async def create_review(
    product_id: int,
    payload: ReviewCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ReviewResponse:
    service = ReviewService(db)
    return await service.add_review(product_id, current_user.id, payload)