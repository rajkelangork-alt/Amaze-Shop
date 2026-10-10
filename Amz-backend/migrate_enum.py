import asyncio
from typing import Any

import src.db.session as session_module
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError

# Resolve async engine or session factory
engine: Any = getattr(
    session_module,
    "engine",
    getattr(
        session_module,
        "async_engine",
        getattr(getattr(session_module, "async_session_maker", None), "kw", {}).get("bind", None),
    ),
)


async def _execute_alter(conn: Any) -> None:
    try:
        await conn.execute(text("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'vendor';"))
        print("Added 'vendor' to user_role enum successfully!")
    except DBAPIError as e:
        print(f"Notice (vendor): {e}")

    try:
        await conn.execute(text("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'VENDOR';"))
        print("Added 'VENDOR' to user_role enum successfully!")
    except DBAPIError as e:
        print(f"Notice (VENDOR): {e}")


async def add_enum_value() -> None:
    if engine:
        async with engine.begin() as conn:
            await _execute_alter(conn)
        return

    session_factory = getattr(
        session_module,
        "AsyncSessionLocal",
        getattr(session_module, "async_session_maker", None),
    )
    if not session_factory:
        raise RuntimeError("Could not resolve database engine in src.db.session")

    async with session_factory() as session:
        conn = await session.connection()
        await _execute_alter(conn)
        await session.commit()


if __name__ == "__main__":
    asyncio.run(add_enum_value())