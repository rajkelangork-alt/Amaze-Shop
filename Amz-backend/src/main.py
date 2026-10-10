from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.api.v1 import api_router
from src.api.v1.vendor import router as vendor_router
from src.core.config import settings
from src.middleware.cors import setup_cors
from src.middleware.error_handler import setup_error_handlers
from src.middleware.request_logger import RequestLoggerMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    yield
    # Teardown logic


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# 1. Setup CORS
setup_cors(app)

# 2. Add Request Logger Middleware
app.add_middleware(RequestLoggerMiddleware)

# 3. Setup Global Exception Handlers
setup_error_handlers(app)

# 4. Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# 5. Include vendor v1 routes
app.include_router(vendor_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }