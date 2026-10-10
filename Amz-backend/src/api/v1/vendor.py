import asyncio
import os
import time
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_vendor
from src.db.session import get_db
from src.models.category import Category
from src.models.product import Product
from src.models.product_image import ProductImage
from src.models.product_variant import ProductVariant
from src.models.user import User

router = APIRouter(prefix="/vendor", tags=["vendor"])


def _save_file_sync(file_path: str, data: bytes) -> None:
    with open(file_path, "wb") as buffer:
        buffer.write(data)


class VendorProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    base_price: float
    category_id: int
    image_url: str | None = None
    stock_quantity: int


@router.get("/products")
async def list_vendor_products(
    db: Annotated[AsyncSession, Depends(get_db)],
    vendor: Annotated[User, Depends(get_current_vendor)],
):
    """Retrieve all catalog products managed by vendors."""
    result = await db.execute(select(Product))
    products = result.scalars().all()
    output = []
    for p in products:
        output.append({
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "base_price": float(p.base_price),
            "category_id": p.category_id,
            "image_url": f"/assets/images/{p.name}.jpg",
            "stock_quantity": 25,
        })
    return output

@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(
    name: Annotated[str, Form(...)],
    description: Annotated[str, Form(...)],
    base_price: Annotated[float, Form(...)],
    category_id: Annotated[int, Form(...)],
    db: Annotated[AsyncSession, Depends(get_db)],
    vendor: Annotated[User, Depends(get_current_vendor)],
    stock_quantity: Annotated[int, Form()] = 10,
    variant_title: Annotated[str, Form()] = "Standard Edition",
    image: Annotated[UploadFile | None, File()] = None,
):
    cat_res = await db.execute(select(Category).where(Category.id == category_id))
    category = cat_res.scalars().first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category_id specified")

    slug = name.lower().replace(" ", "-").replace("/", "-")
    existing_slug = (await db.execute(select(Product).where(Product.slug == slug))).scalars().first()
    if existing_slug:
        slug = f"{slug}-{int(time.time())}"

    new_product = Product(
        name=name,
        slug=slug,
        description=description,
        base_price=base_price,
        category_id=category_id,
        is_featured=True,
    )
    db.add(new_product)
    await db.flush()

    variant = ProductVariant(
        product_id=new_product.id,
        title=variant_title,
        sku=f"SKU-{new_product.id}-STD",
        price=base_price,
        stock_quantity=stock_quantity,
    )
    db.add(variant)

    image_url = f"/assets/images/{name}.jpg"
    if image and image.filename:
        upload_dir = os.path.join("..", "Amz-frontend", "public", "assets", "images")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"{name}.jpg")
        content = await image.read()
        await asyncio.to_thread(_save_file_sync, file_path, content)

    product_image = ProductImage(
        product_id=new_product.id,
        image_url=image_url,
        is_primary=True,
    )
    db.add(product_image)

    await db.commit()
    await db.refresh(new_product)

    return {
        "message": "Product created successfully",
        "product_id": new_product.id,
        "name": new_product.name,
        "base_price": new_product.base_price,
        "image_url": image_url,
    }