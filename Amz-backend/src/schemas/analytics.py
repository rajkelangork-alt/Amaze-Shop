from decimal import Decimal

from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_sales: Decimal
    total_orders: int
    total_users: int
    total_products: int


class LowStockItem(BaseModel):
    product_id: int
    product_name: str
    variant_id: int
    sku: str
    quantity_available: int