from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user, require_admin
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.shop.shop_schema import (
    ShopItemResponse,
    PurchaseRequest,
    PurchaseResponse,
    ShopAdminSummaryResponse,
    PopularItemResponse,
    InventoryItemResponse,
    EquipInventoryRequest,
)
from src.core.api.v1.domain.shop.shop_service import ShopService

router = APIRouter(prefix="/shop", tags=["shop"])


@router.get("/items", response_model=list[ShopItemResponse])
async def get_shop_items(
    available_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    service = ShopService(db)
    return await service.get_items(available_only)


@router.get("/items/{category}", response_model=list[ShopItemResponse])
async def get_items_by_category(
    category: str,
    available_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    service = ShopService(db)
    return await service.get_items_by_category(category, available_only)


@router.post("/purchase", response_model=PurchaseResponse, status_code=200)
async def purchase_item(
    body: PurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ShopService(db)
    result = await service.purchase_item(current_user.id, body.item_id)
    return PurchaseResponse(
        success=result["success"],
        remaining_points=result["remaining_points"],
        purchased_item=ShopItemResponse.model_validate(result["purchased_item"]),
    )


@router.get("/inventory", response_model=list[InventoryItemResponse])
async def get_my_inventory(
    category: str | None = None,
    include_expired: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ShopService(db)
    return await service.get_user_inventory(current_user.id, category, include_expired)


@router.post("/inventory/equip", response_model=InventoryItemResponse)
async def equip_inventory_item(
    body: EquipInventoryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ShopService(db)
    return await service.equip_inventory(current_user.id, body.inventory_id)


@router.get("/my-purchases", response_model=list[ShopItemResponse])
async def get_my_purchases(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ShopService(db)
    purchases = await service.get_user_purchases(current_user.id, limit, offset)
    # Convert purchase logs to items
    result = []
    for purchase in purchases:
        item = await service.repository.get_item(purchase.item_id)
        if item:
            result.append(item)
    return result


@router.get("/admin/summary", response_model=ShopAdminSummaryResponse)
async def get_admin_summary(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = ShopService(db)
    summary = await service.get_admin_summary()
    return ShopAdminSummaryResponse(
        total_items=summary["total_items"],
        total_purchases_today=summary["total_purchases_today"],
        total_points_spent_today=summary["total_points_spent_today"],
        popular_items=[PopularItemResponse(**item) for item in summary["popular_items"]],
    )
