import asyncio

import src.db.session as session_module
from sqlalchemy import select, text
from src.core.constants import UserRole
from src.core.security import get_password_hash
from src.models.user import User

SessionMaker = getattr(
    session_module,
    "AsyncSessionLocal",
    getattr(session_module, "async_session_maker", None)
)

async def seed():
    if not SessionMaker:
        raise RuntimeError("No Async session maker found in src.db.session")

    accounts = [
        # 5 Customer Accounts
        {"email": "customer1@amzshop.com", "name": ("John", "Doe"), "role": UserRole.CUSTOMER},
        {"email": "customer2@amzshop.com", "name": ("Sarah", "Connor"), "role": UserRole.CUSTOMER},
        {"email": "customer3@amzshop.com", "name": ("Michael", "Scott"), "role": UserRole.CUSTOMER},
        {"email": "customer4@amzshop.com", "name": ("Elena", "Rostova"), "role": UserRole.CUSTOMER},
        {"email": "customer5@amzshop.com", "name": ("David", "Kim"), "role": UserRole.CUSTOMER},
        # 4 Vendor Accounts
        {"email": "vendor.apex@amzshop.com", "name": ("Apex", "Supplies Ltd"), "role": UserRole.VENDOR},
        {"email": "vendor.nova@amzshop.com", "name": ("Nova", "Retail Global"), "role": UserRole.VENDOR},
        {"email": "vendor.zenith@amzshop.com", "name": ("Zenith", "Hardware & Sports"), "role": UserRole.VENDOR},
        {"email": "vendor.prime@amzshop.com", "name": ("Prime", "Merchants Hub"), "role": UserRole.VENDOR},
        # 1 Admin Account
        {"email": "admin@amzshop.com", "name": ("System", "Admin"), "role": UserRole.ADMIN},
    ]

    async with SessionMaker() as db:
        await db.execute(text("SET search_path TO amaze_shop, public;"))
        for acc in accounts:
            result = await db.execute(select(User).where(User.email == acc["email"]))
            existing = result.scalars().first()
            pwd_hash = get_password_hash("password123")

            if not existing:
                user = User(
                    email=acc["email"],
                    hashed_password=pwd_hash,
                    first_name=acc["name"][0],
                    last_name=acc["name"][1],
                    role=acc["role"],
                    is_active=True,
                )
                db.add(user)
                print(f"Created: {acc['email']}")
            else:
                print(f"Already exists: {acc['email']}")
        await db.commit()
        print("Database seeded with 5 Customers, 4 Vendors, and 1 Admin successfully!")

if __name__ == "__main__":
    asyncio.run(seed())