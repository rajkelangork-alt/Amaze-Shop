import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_order_creation_flow(client: AsyncClient, auth_headers: dict[str, str], seeded_product):
    # 1. Add item to cart
    cart_resp = await client.post(
        "/api/v1/cart/items",
        json={"variant_id": seeded_product.id, "quantity": 1},
        headers=auth_headers,
    )
    assert cart_resp.status_code in (200, 201)

    # 2. Checkout order
    order_payload = {
        "payment_method": "stripe",
        "notes": "Automated test order",
    }
    order_resp = await client.post("/api/v1/orders", json=order_payload, headers=auth_headers)
    assert order_resp.status_code in (200, 201)
    order_data = order_resp.json()

    # Verify order structure
    assert "id" in order_data or "order_number" in order_data
    if "status" in order_data:
        assert order_data["status"].lower() in ("pending", "created", "completed", "confirmed")
    if "items" in order_data and len(order_data["items"]) > 0:
        assert order_data["items"][0]["variant_id"] == seeded_product.id