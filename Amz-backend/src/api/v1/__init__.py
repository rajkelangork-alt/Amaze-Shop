from fastapi import APIRouter

from src.api.v1.admin import router as admin_router
from src.api.v1.analytics import router as analytics_router
from src.api.v1.auth import router as auth_router
from src.api.v1.cart import router as cart_router
from src.api.v1.categories import router as categories_router
from src.api.v1.checkout import router as checkout_router
from src.api.v1.health import router as health_router
from src.api.v1.inventory import router as inventory_router
from src.api.v1.orders import router as orders_router
from src.api.v1.payments import router as payments_router
from src.api.v1.products import router as products_router
from src.api.v1.refunds import router as refunds_router
from src.api.v1.reviews import router as reviews_router
from src.api.v1.search import router as search_router
from src.api.v1.users import router as users_router
from src.api.v1.wishlist import router as wishlist_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(categories_router)
api_router.include_router(products_router)
api_router.include_router(cart_router)
api_router.include_router(checkout_router)
api_router.include_router(orders_router)
api_router.include_router(payments_router)
api_router.include_router(reviews_router)
api_router.include_router(wishlist_router)
api_router.include_router(search_router)
api_router.include_router(inventory_router)
api_router.include_router(refunds_router)
api_router.include_router(analytics_router)
api_router.include_router(admin_router)

__all__ = ["api_router"]