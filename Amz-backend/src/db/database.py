from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from src.core.config import settings

# Async Engine for FastAPI runtime operations
async_engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={
        "server_settings": {
            "search_path": "amaze_shop"
        }
    },
)

# Async Session Maker
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Sync Engine used primarily for Alembic migrations
sync_engine = create_engine(
    settings.SYNC_DATABASE_URL,
    connect_args={"options": "-csearch_path=amaze_shop,public"},
    pool_pre_ping=True,
)