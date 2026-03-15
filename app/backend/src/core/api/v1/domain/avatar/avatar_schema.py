from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class AvatarItemResponse(BaseModel):
    id: uuid.UUID
    category: str  # hair, top, bottom, accessory
    name: str
    description: str
    preview_color: str
    preview_image: str | None
    rarity: str | None  # common, rare, epic, legendary
    price_tp: int
    is_active: bool
    duration_type: str  # permanent, timed
    duration_days: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserAvatarInventoryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    item_id: uuid.UUID
    item: AvatarItemResponse
    owned_at: datetime
    expires_at: datetime | None
    is_equipped: bool

    model_config = {"from_attributes": True}


class EquippedAvatarResponse(BaseModel):
    hair: UserAvatarInventoryResponse | None
    top: UserAvatarInventoryResponse | None
    bottom: UserAvatarInventoryResponse | None
    accessory: UserAvatarInventoryResponse | None


class AvatarEquipRequest(BaseModel):
    item_id: uuid.UUID
    category: str


class AvatarUnequipRequest(BaseModel):
    category: str


class AvatarEquipResponse(BaseModel):
    success: bool
    equipped: EquippedAvatarResponse


class AvatarAdminSummaryResponse(BaseModel):
    total_items: int
    items_by_category: dict[str, int]
    timed_items_count: int
    permanent_items_count: int
