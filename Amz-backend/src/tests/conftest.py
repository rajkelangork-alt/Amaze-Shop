from collections.abc import AsyncGenerator
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.core.constants import UserRole
from src.core.security import create_access_token
from src.db.session import get_db
from src.main import app
from src.models.base import Base
from src.models.category import Category
from src.models.inventory import Inventory
from src.models.product import Product
from src.models.product_variant import ProductVariant
from src.models.user import User

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(autouse=True)
async def setup_and_clean_db():
    """Create all tables before each test and drop them after, preventing UNIQUE collisions."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    user_cols = {c.name for c in User.__table__.columns}
    user_data = {
        "email": "test_customer@amzshop.com",
        "hashed_password": "hashed_dummy_password",
        "role": UserRole.CUSTOMER,
        "is_active": True,
    }
    if "first_name" in user_cols:
        user_data["first_name"] = "Test"
    if "last_name" in user_cols:
        user_data["last_name"] = "Customer"

    user = User(**user_data)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_admin(db_session: AsyncSession) -> User:
    user_cols = {c.name for c in User.__table__.columns}
    admin_data = {
        "email": "test_admin@amzshop.com",
        "hashed_password": "hashed_dummy_password",
        "role": UserRole.ADMIN,
        "is_active": True,
    }
    if "first_name" in user_cols:
        admin_data["first_name"] = "Admin"
    if "last_name" in user_cols:
        admin_data["last_name"] = "User"

    admin = User(**admin_data)
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    # Pass user.id as string to satisfy int(payload['sub']) in src/api/deps.py:32
    token = create_access_token(str(test_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin: User) -> dict[str, str]:
    token = create_access_token(str(test_admin.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def seeded_product(db_session: AsyncSession) -> ProductVariant:
    category = Category(name="Electronics Test", slug="electronics-test")
    db_session.add(category)
    await db_session.flush()

    prod_cols = {c.name for c in Product.__table__.columns}
    prod_data = {
        "name": "Test Smartphone",
        "slug": "test-smartphone",
        "base_price": Decimal("299.99"),
        "is_featured": True,
        "category_id": category.id,
    }
    if "description" in prod_cols:
        prod_data["description"] = "A high-performance smartphone for testing."
    if "is_active" in prod_cols:
        prod_data["is_active"] = True

    product = Product(**prod_data)
    db_session.add(product)
    await db_session.flush()

    variant = ProductVariant(
        product_id=product.id,
        title="Pro 128GB",
        sku="TEST-PHONE-PRO",
        price=Decimal("299.99"),
    )
    db_session.add(variant)
    await db_session.flush()

    inv_cols = {c.name for c in Inventory.__table__.columns}
    inv_data = {"variant_id": variant.id}
    if "quantity_on_hand" in inv_cols:
        inv_data["quantity_on_hand"] = 50
    if "quantity_available" in inv_cols:
        inv_data["quantity_available"] = 50
    if "quantity_reserved" in inv_cols:
        inv_data["quantity_reserved"] = 0

    inventory = Inventory(**inv_data)
    db_session.add(inventory)
    await db_session.commit()
    return variant