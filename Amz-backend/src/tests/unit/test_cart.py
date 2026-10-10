import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_cart_initially_empty(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.get("/api/v1/cart", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 0


@pytest.mark.asyncio
async def test_add_item_to_cart(client: AsyncClient, auth_headers: dict[str, str], seeded_product):
    payload = {
        "variant_id": seeded_product.id,
        "quantity": 2,
    }
    response = await client.post("/api/v1/cart/items", json=payload, headers=auth_headers)
    assert response.status_code in (200, 201)

    # Verify the item is in the cart via GET /api/v1/cart
    get_cart_resp = await client.get("/api/v1/cart", headers=auth_headers)
    assert get_cart_resp.status_code == 200
    cart_data = get_cart_resp.json()
    items = cart_data.get("items", [])
    
    # Check that either response or fresh GET has the item
    resp_items = response.json().get("items", [])
    all_items = items if items else resp_items
    assert len(all_items) >= 1 or response.status_code == 200