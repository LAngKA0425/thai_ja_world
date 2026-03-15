from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, computed_field


class ShopItemResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    category: str  # nickname_color, badge, minihome_skin, emoji, miniroom_item
    price: int
    image_url: str
    is_available: bool
    duration_days: int | None  # for time-limited items
    created_at: datetime

    model_config = {"from_attributes": True}


class ShopCategoryResponse(BaseModel):
    id: str
    label: str
    emoji: str
    item_count: int


class PurchaseRequest(BaseModel):
    item_id: uuid.UUID


class PurchaseResponse(BaseModel):
    success: bool
    remaining_points: int
    purchased_item: ShopItemResponse

    @computed_field(return_type=int)
    @property
    def remaining_gems(self) -> int:
        return self.remaining_points


class PopularItemResponse(BaseModel):
    item_id: uuid.UUID
    item_name: str
    purchase_count: int


class ShopAdminSummaryResponse(BaseModel):
    total_items: int
    total_purchases_today: int
    total_points_spent_today: int
    popular_items: list[PopularItemResponse]


class InventoryItemResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    item_id: uuid.UUID
    category: str
    is_equipped: bool
    acquired_at: datetime
    expires_at: datetime | None

    model_config = {"from_attributes": True}


class EquipInventoryRequest(BaseModel):
    inventory_id: uuid.UUID
