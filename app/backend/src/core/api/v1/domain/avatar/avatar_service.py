from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.avatar.avatar_repository import (
    AvatarRepository,
    AvatarItem,
    UserAvatarInventory,
)
from src.core.errors import not_found, bad_request


class AvatarService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = AvatarRepository(db)

    async def get_items(self, category: str | None = None, active_only: bool = True) -> list[AvatarItem]:
        if category:
            return await self.repository.get_items_by_category(category, active_only)
        return await self.repository.get_all_items(active_only)

    async def get_user_inventory(self, user_id: uuid.UUID) -> list[UserAvatarInventory]:
        return await self.repository.get_user_inventory(user_id)

    async def get_equipped(self, user_id: uuid.UUID) -> dict[str, UserAvatarInventory | None]:
        equipped_list = await self.repository.get_equipped_items(user_id)
        result: dict[str, UserAvatarInventory | None] = {
            "hair": None,
            "top": None,
            "bottom": None,
            "accessory": None,
        }
        for inv in equipped_list:
            item = await self.repository.get_item(inv.item_id)
            if item:
                result[item.category] = inv
        return result

    async def purchase_and_add(
        self, user_id: uuid.UUID, item_id: uuid.UUID, user_points: int
    ) -> dict:
        item = await self.repository.get_item(item_id)
        if not item:
            raise not_found("Avatar item not found")
        if not item.is_active:
            raise bad_request("ITEM_UNAVAILABLE", "This avatar item is not available")
        if user_points < item.price_tp:
            raise bad_request("INSUFFICIENT_POINTS", "Not enough TP")

        expires_at = None
        if item.duration_type == "timed" and item.duration_days:
            expires_at = datetime.now(timezone.utc) + timedelta(days=item.duration_days)

        inventory_entry = await self.repository.add_to_inventory(user_id, item_id, expires_at)

        return {
            "success": True,
            "remaining_points": user_points - item.price_tp,
            "inventory_entry": inventory_entry,
            "item": item,
        }

    async def equip_item(self, user_id: uuid.UUID, item_id: uuid.UUID, category: str) -> dict:
        inventory = await self.repository.get_user_inventory(user_id)
        inv_item = None
        for inv in inventory:
            if inv.item_id == item_id:
                inv_item = inv
                break

        if not inv_item:
            raise bad_request("NOT_OWNED", "You do not own this item")

        # 만료 확인
        if inv_item.expires_at and inv_item.expires_at < datetime.now(timezone.utc):
            raise bad_request("ITEM_EXPIRED", "This item has expired")

        await self.repository.equip_item(user_id, inv_item.id, category)

        equipped = await self.get_equipped(user_id)
        return {"success": True, "equipped": equipped}

    async def unequip(self, user_id: uuid.UUID, category: str) -> dict:
        await self.repository.unequip_category(user_id, category)
        equipped = await self.get_equipped(user_id)
        return {"success": True, "equipped": equipped}

    async def get_admin_summary(self) -> dict:
        total = await self.repository.count_all_items()
        by_category = await self.repository.count_by_category()

        all_items = await self.repository.get_all_items(active_only=False)
        timed = sum(1 for i in all_items if i.duration_type == "timed")
        permanent = sum(1 for i in all_items if i.duration_type == "permanent")

        return {
            "total_items": total,
            "items_by_category": by_category,
            "timed_items_count": timed,
            "permanent_items_count": permanent,
        }
