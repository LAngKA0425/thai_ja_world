from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.shop.shop_repository import (
    ShopRepository,
    ShopItem,
    PurchaseLog,
    UserShopInventory,
)
from src.core.api.v1.domain.points.points_service import PointsService
from src.core.errors import not_found, bad_request


class ShopService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = ShopRepository(db)

    async def get_items(self, available_only: bool = True) -> list[ShopItem]:
        return await self.repository.get_all_items(available_only)

    async def get_items_by_category(self, category: str, available_only: bool = True) -> list[ShopItem]:
        return await self.repository.get_items_by_category(category, available_only)

    async def purchase_item(self, user_id: uuid.UUID, item_id: uuid.UUID) -> dict:
        item = await self.repository.get_item(item_id)
        if not item:
            raise not_found("Item not found")
        if not item.is_available:
            raise bad_request("ITEM_UNAVAILABLE", "This item is no longer available")

        points_service = PointsService(self.db)
        balance = await points_service.get_user_balance(user_id)
        if balance.available_points < item.price:
            raise bad_request("INSUFFICIENT_POINTS", "Insufficient points to purchase this item")

        expires_at = None
        if item.duration_days:
            expires_at = datetime.now(timezone.utc) + timedelta(days=item.duration_days)

        purchase_log = None
        inventory = None
        async with self.db.begin_nested():
            # Atomic purchase flow:
            # 1) spend points + write point transaction
            # 2) create purchase log
            # 3) grant inventory
            # 4) apply equipped side effects for equip-capable categories
            await points_service.spend_points(
                user_id=user_id,
                amount=item.price,
                reason=f"{item.name} 구매",
                source_type="shop",
            )

            purchase_log = await self.repository.create_purchase_log(user_id, item_id, item.price, expires_at)
            inventory = await self.repository.add_inventory_item(
                user_id=user_id,
                item=item,
                expires_at=expires_at,
                equipped=item.category in {"minihome_skin", "bgm"},
            )

            if item.category == "bgm":
                from src.core.api.v1.domain.minihome.minihome_service import MinihomeService

                minihome_service = MinihomeService(self.db)
                added = await minihome_service.add_bgm(
                    user_id=user_id,
                    title=item.name,
                    artist=None,
                    url=item.image_url,
                    shop_item_id=item.id,
                    purchase_id=purchase_log.id,
                    is_representative=False,
                )
                representative = await minihome_service.get_representative_bgm(user_id)
                if representative is None:
                    await minihome_service.set_representative_bgm(user_id, added.id)

            if item.category == "minihome_skin":
                from src.core.api.v1.domain.minihome.minihome_service import MinihomeService

                minihome_service = MinihomeService(self.db)
                await minihome_service.update_profile(user_id=user_id, skin_id=str(item.id))

        refreshed = await points_service.get_user_balance(user_id)

        return {
            "success": True,
            "remaining_points": refreshed.available_points,
            "purchased_item": item,
            "purchase_log": purchase_log,
            "inventory": inventory,
        }

    async def get_user_purchases(self, user_id: uuid.UUID, limit: int = 50, offset: int = 0) -> list[PurchaseLog]:
        return await self.repository.get_user_purchases(user_id, limit, offset)

    async def get_user_inventory(
        self,
        user_id: uuid.UUID,
        category: str | None = None,
        include_expired: bool = False,
    ) -> list[UserShopInventory]:
        return await self.repository.get_user_inventory(user_id, category, include_expired)

    async def equip_inventory(self, user_id: uuid.UUID, inventory_id: uuid.UUID) -> UserShopInventory:
        target = await self.repository.get_inventory_item(inventory_id, user_id)
        if not target:
            raise not_found("Inventory item not found")
        if target.expires_at and target.expires_at <= datetime.now(timezone.utc):
            raise bad_request("ITEM_EXPIRED", "This item has expired")

        async with self.db.begin_nested():
            equipped = await self.repository.equip_inventory_item(user_id, inventory_id)
            if not equipped:
                raise not_found("Inventory item not found")

            if equipped.category == "minihome_skin":
                item = await self.repository.get_item(equipped.item_id)
                if item:
                    from src.core.api.v1.domain.minihome.minihome_service import MinihomeService
                    minihome_service = MinihomeService(self.db)
                    await minihome_service.update_profile(user_id=user_id, skin_id=str(item.id))

            if equipped.category == "bgm":
                from src.core.api.v1.domain.minihome.minihome_service import MinihomeService

                minihome_service = MinihomeService(self.db)
                bgm_list = await minihome_service.get_bgm_list(user_id)
                bgm_target = next((row for row in bgm_list if row.shop_item_id == equipped.item_id), None)
                if bgm_target:
                    await minihome_service.set_representative_bgm(user_id, bgm_target.id)

        return equipped

    async def get_admin_summary(self) -> dict:
        total_items = await self.repository.count_all_items()

        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        purchases_today_result = await self.db.execute(
            select(func.count()).select_from(PurchaseLog)
            .where(PurchaseLog.purchased_at >= today_start)
        )
        purchases_today = purchases_today_result.scalar_one() or 0

        points_spent_result = await self.db.execute(
            select(func.sum(PurchaseLog.price_paid)).select_from(PurchaseLog)
            .where(PurchaseLog.purchased_at >= today_start)
        )
        points_spent = points_spent_result.scalar_one() or 0

        popular_items_result = await self.db.execute(
            select(PurchaseLog.item_id, func.count().label("count"))
            .select_from(PurchaseLog)
            .group_by(PurchaseLog.item_id)
            .order_by(func.count().desc())
            .limit(5)
        )
        popular_items_raw = popular_items_result.all()

        popular_items = []
        for item_id, count in popular_items_raw:
            item = await self.repository.get_item(item_id)
            if item:
                popular_items.append({
                    "item_id": item_id,
                    "item_name": item.name,
                    "purchase_count": count,
                })

        return {
            "total_items": total_items,
            "total_purchases_today": purchases_today,
            "total_points_spent_today": points_spent,
            "popular_items": popular_items,
        }
