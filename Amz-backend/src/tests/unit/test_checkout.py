import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_checkout_empty_cart_fails(client: AsyncClient, auth_headers: dict[str, str]):
    payload = {"payment_method": "stripe"}
    response = await client.post("/api/v1/orders", json=payload, headers=auth_headers)
    assert response.status_code in (400, 422)