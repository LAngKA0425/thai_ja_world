from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user, require_admin
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.avatar.avatar_schema import (
    AvatarItemResponse,
    UserAvatarInventoryResponse,
    EquippedAvatarResponse,
    AvatarEquipRequest,
    AvatarUnequipRequest,
    AvatarEquipResponse,
    AvatarAdminSummaryResponse,
)
from src.core.api.v1.domain.avatar.avatar_service import AvatarService

router = APIRouter(prefix="/avatar", tags=["avatar"])


@router.get("/items", response_model=list[AvatarItemResponse])
async def get_avatar_items(
    category: str | None = Query(None),
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    service = AvatarService(db)
    return await service.get_items(category, active_only)


@router.get("/inventory", response_model=list[UserAvatarInventoryResponse])
async def get_my_inventory(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AvatarService(db)
    return await service.get_user_inventory(current_user.id)


@router.get("/equipped", response_model=EquippedAvatarResponse)
async def get_equipped_avatar(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AvatarService(db)
    equipped = await service.get_equipped(current_user.id)
    return EquippedAvatarResponse(
        hair=equipped.get("hair"),
        top=equipped.get("top"),
        bottom=equipped.get("bottom"),
        accessory=equipped.get("accessory"),
    )


@router.post("/equip", response_model=AvatarEquipResponse)
async def equip_avatar_item(
    body: AvatarEquipRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AvatarService(db)
    result = await service.equip_item(current_user.id, body.item_id, body.category)
    return AvatarEquipResponse(
        success=result["success"],
        equipped=EquippedAvatarResponse(
            hair=result["equipped"].get("hair"),
            top=result["equipped"].get("top"),
            bottom=result["equipped"].get("bottom"),
            accessory=result["equipped"].get("accessory"),
        ),
    )


@router.post("/unequip", response_model=AvatarEquipResponse)
async def unequip_avatar_item(
    body: AvatarUnequipRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AvatarService(db)
    result = await service.unequip(current_user.id, body.category)
    return AvatarEquipResponse(
        success=result["success"],
        equipped=EquippedAvatarResponse(
            hair=result["equipped"].get("hair"),
            top=result["equipped"].get("top"),
            bottom=result["equipped"].get("bottom"),
            accessory=result["equipped"].get("accessory"),
        ),
    )


@router.get("/admin/summary", response_model=AvatarAdminSummaryResponse)
async def get_admin_summary(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = AvatarService(db)
    summary = await service.get_admin_summary()
    return AvatarAdminSummaryResponse(
        total_items=summary["total_items"],
        items_by_category=summary["items_by_category"],
        timed_items_count=summary["timed_items_count"],
        permanent_items_count=summary["permanent_items_count"],
    )
