from collections.abc import Sequence
from typing import Any, Generic, TypeVar

from sqlalchemy import delete, select, update
from sqlalchemy.engine import CursorResult
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: int) -> ModelType | None:
        result = await self.session.execute(
            select(self.model).where(self.model.__table__.c.id == id)
        )
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[ModelType]:
        result = await self.session.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def create(self, attributes: dict[str, Any]) -> ModelType:
        db_obj = self.model(**attributes)
        self.session.add(db_obj)
        await self.session.flush()
        return db_obj

    async def update(self, id: int, attributes: dict[str, Any]) -> ModelType | None:
        query = (
            update(self.model)
            .where(self.model.__table__.c.id == id)
            .values(**attributes)
            .returning(self.model)
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def delete(self, id: int) -> bool:
        query = delete(self.model).where(self.model.__table__.c.id == id)
        result = await self.session.execute(query)
        if isinstance(result, CursorResult):
            return (result.rowcount or 0) > 0
        return False