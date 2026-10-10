import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_refund_invalid_payment(client: AsyncClient, admin_headers: dict[str, str]):
    payload = {
        "payment_id": 999999,
        "amount": 10.0,
        "reason": "Test refund non-existent payment",
    }
    response = await client.post("/api/v1/refunds", json=payload, headers=admin_headers)
    assert response.status_code in (400, 404, 422, 500)