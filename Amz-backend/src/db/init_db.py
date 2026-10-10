import asyncio
from decimal import Decimal

from sqlalchemy import select

from src.core.constants import UserRole
from src.core.security import get_password_hash
from src.db.database import AsyncSessionLocal
from src.models import (
    Category,
    Inventory,
    Product,
    ProductVariant,
    User,
)

# The 20 required catalog categories
CATEGORIES = [
    "Electronics", "Fashion", "Home & Garden", "Sports & Outdoors",
    "Books", "Beauty & Personal Care", "Toys & Games", "Automotive",
    "Food & Beverages", "Pet Supplies", "Health & Wellness", "Office Supplies",
    "Arts & Crafts", "Musical Instruments", "Video Games", "Jewelry",
    "Luggage & Travel", "Kitchen Appliances", "Garden Tools", "Smart Home"
]


def slugify(text: str) -> str:
    return text.lower().replace(" & ", "-").replace(" ", "-")


async def seed_data() -> None:
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        existing_cat = await session.execute(select(Category))
        if existing_cat.scalars().first():
            print("Database already contains seed data. Skipping...")
            return

        print("Seeding default admin and customer accounts...")
        admin_user = User(
            email="admin@amzshop.com",
            hashed_password=get_password_hash("Admin@12345"),
            first_name="Admin",
            last_name="User",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        test_customer = User(
            email="customer@amzshop.com",
            hashed_password=get_password_hash("Customer@12345"),
            first_name="John",
            last_name="Doe",
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=True,
        )
        session.add_all([admin_user, test_customer])
        await session.flush()

        print("Seeding 20 categories and 100 products...")
        for cat_name in CATEGORIES:
            cat_slug = slugify(cat_name)
            category = Category(
                name=cat_name,
                slug=cat_slug,
                description=f"Curated selection of top quality items in {cat_name}."
            )
            session.add(category)
            await session.flush()

            # Create 5 products per category (20 x 5 = 100 products)
            for i in range(1, 6):
                prod_name = f"{cat_name} Item {i}"
                prod_slug = f"{cat_slug}-item-{i}"
                base_price = Decimal(str(19.99 + (i * 15.0)))

                product = Product(
                    name=prod_name,
                    slug=prod_slug,
                    description=f"Premium specification for {prod_name}. Engineered for performance and durability.",
                    base_price=base_price,
                    is_active=True,
                    is_featured=(i == 1),
                    category_id=category.id,
                )
                session.add(product)
                await session.flush()

                # Default SKU variant
                variant = ProductVariant(
                    product_id=product.id,
                    sku=f"SKU-{category.id:02d}-{product.id:03d}-DEF",
                    title="Standard Edition",
                    price=base_price,
                    is_default=True,
                )
                session.add(variant)
                await session.flush()

                # Initial stock ledger
                inventory = Inventory(
                    variant_id=variant.id,
                    quantity_available=50,
                    quantity_reserved=0,
                )
                session.add(inventory)

        await session.commit()
        print("Database seeding completed successfully! (20 Categories, 100 Products, 100 Inventory records)")


if __name__ == "__main__":
    asyncio.run(seed_data())