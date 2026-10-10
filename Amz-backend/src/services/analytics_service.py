from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import Order, Product, User
from src.schemas.analytics import AnalyticsOverview


class AnalyticsService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_overview(self) -> AnalyticsOverview:
        sales_val = (await self.session.execute(select(func.coalesce(func.sum(Order.total_amount), 0.0)))).scalar() or 0.0
        orders_cnt = (await self.session.execute(select(func.count(Order.id)))).scalar() or 0
        users_cnt = (await self.session.execute(select(func.count(User.id)))).scalar() or 0
        products_cnt = (await self.session.execute(select(func.count(Product.id)))).scalar() or 0

        return AnalyticsOverview(
            total_sales=Decimal(str(sales_val)),
            total_orders=orders_cnt,
            total_users=users_cnt,
            total_products=products_cnt,
        )