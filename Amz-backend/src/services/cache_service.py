import json
from typing import Any

import redis.asyncio as redis

from src.core.config import settings


class CacheService:
    def __init__(self) -> None:
        self.redis_url = settings.REDIS_URL

    async def get(self, key: str) -> Any | None:
        try:
            client = redis.from_url(self.redis_url)
            data = await client.get(key)
            await client.aclose()
            return json.loads(data) if data else None
        except (redis.RedisError, json.JSONDecodeError):
            return None

    async def set(self, key: str, value: Any, expire_seconds: int = 300) -> None:
        try:
            client = redis.from_url(self.redis_url)
            await client.set(key, json.dumps(value), ex=expire_seconds)
            await client.aclose()
        except (redis.RedisError, TypeError):
            pass