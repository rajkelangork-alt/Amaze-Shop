from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_active_admin
from src.db.session import get_db
from src.models.user import User
from src.schemas.analytics import AnalyticsOverview
from src.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get(
    "/overview",
    response_model=AnalyticsOverview,
    status_code=status.HTTP_200_OK,
    summary="Get business overview analytics",
)
async def get_overview(
    _: Annotated[User, Depends(get_current_active_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AnalyticsOverview:
    service = AnalyticsService(db)
    return await service.get_overview()