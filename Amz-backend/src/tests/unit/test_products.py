import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_products(client: AsyncClient, seeded_product):
    response = await client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    items = data.get("items", data) if isinstance(data, dict) else data
    assert len(items) >= 1