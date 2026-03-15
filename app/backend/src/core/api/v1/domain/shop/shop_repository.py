from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.infra.db import Base


class ShopItem(Base):
    __tablename__ = "shop_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # nickname_color, badge, minihome_skin, emoji, miniroom_item
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)  # for time-limited items
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PurchaseLog(Base):
    __tablename__ = "purchase_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("shop_items.id"), nullable=False)
    price_paid: Mapped[int] = mapped_column(Integer, nullable=False)
    purchased_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class UserShopInventory(Base):
    __tablename__ = "user_shop_inventory"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("shop_items.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    is_equipped: Mapped[bool] = mapped_column(Boolean, default=False)
    acquired_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class ShopRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_items(self, available_only: bool = True) -> list[ShopItem]:
        stmt = select(ShopItem).order_by(ShopItem.created_at.desc())
        if available_only:
            stmt = stmt.where(ShopItem.is_available == True)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_items_by_category(self, category: str, available_only: bool = True) -> list[ShopItem]:
        stmt = select(ShopItem).where(ShopItem.category == category).order_by(ShopItem.created_at.desc())
        if available_only:
            stmt = stmt.where(ShopItem.is_available == True)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_item(self, item_id: uuid.UUID) -> ShopItem | None:
        result = await self.db.execute(select(ShopItem).where(ShopItem.id == item_id))
        return result.scalar_one_or_none()

    async def create_item(
        self,
        name: str,
        description: str,
        category: str,
        price: int,
        image_url: str,
        is_available: bool = True,
        duration_days: int | None = None,
    ) -> ShopItem:
        item = ShopItem(
            name=name,
            description=description,
            category=category,
            price=price,
            image_url=image_url,
            is_available=is_available,
            duration_days=duration_days,
        )
        self.db.add(item)
        await self.db.flush()
        await self.db.refresh(item)
        return item

    async def create_purchase_log(
        self,
        user_id: uuid.UUID,
        item_id: uuid.UUID,
        price_paid: int,
        expires_at: datetime | None = None,
    ) -> PurchaseLog:
        log = PurchaseLog(user_id=user_id, item_id=item_id, price_paid=price_paid, expires_at=expires_at)
        self.db.add(log)
        await self.db.flush()
        await self.db.refresh(log)
        return log

    async def get_user_purchases(self, user_id: uuid.UUID, limit: int = 50, offset: int = 0) -> list[PurchaseLog]:
        result = await self.db.execute(
            select(PurchaseLog)
            .where(PurchaseLog.user_id == user_id)
            .order_by(PurchaseLog.purchased_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def add_inventory_item(
        self,
        user_id: uuid.UUID,
        item: ShopItem,
        expires_at: datetime | None = None,
        equipped: bool = False,
    ) -> UserShopInventory:
        inventory = UserShopInventory(
            user_id=user_id,
            item_id=item.id,
            category=item.category,
            expires_at=expires_at,
            is_equipped=equipped,
        )
        self.db.add(inventory)
        await self.db.flush()
        await self.db.refresh(inventory)
        return inventory

    async def get_user_inventory(
        self,
        user_id: uuid.UUID,
        category: str | None = None,
        include_expired: bool = False,
    ) -> list[UserShopInventory]:
        stmt = (
            select(UserShopInventory)
            .where(UserShopInventory.user_id == user_id)
            .order_by(UserShopInventory.acquired_at.desc())
        )
        if category:
            stmt = stmt.where(UserShopInventory.category == category)
        if not include_expired:
            now = datetime.now(timezone.utc)
            stmt = stmt.where((UserShopInventory.expires_at.is_(None)) | (UserShopInventory.expires_at > now))
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_inventory_item(self, inventory_id: uuid.UUID, user_id: uuid.UUID) -> UserShopInventory | None:
        result = await self.db.execute(
            select(UserShopInventory).where(
                (UserShopInventory.id == inventory_id) & (UserShopInventory.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    async def equip_inventory_item(self, user_id: uuid.UUID, inventory_id: uuid.UUID) -> UserShopInventory | None:
        target = await self.get_inventory_item(inventory_id, user_id)
        if not target:
            return None

        # Same category allows only one equipped item.
        result = await self.db.execute(
            select(UserShopInventory).where(
                (UserShopInventory.user_id == user_id) & (UserShopInventory.category == target.category)
            )
        )
        for row in result.scalars().all():
            row.is_equipped = row.id == target.id

        await self.db.flush()
        await self.db.refresh(target)
        return target

    async def count_all_items(self) -> int:
        result = await self.db.execute(select(func.count()).select_from(ShopItem))
        return result.scalar_one()

    async def count_total_categories(self) -> int:
        result = await self.db.execute(select(func.count(func.distinct(ShopItem.category))).select_from(ShopItem))
        return result.scalar_one()

    async def get_categories(self) -> list[str]:
        result = await self.db.execute(select(func.distinct(ShopItem.category)).select_from(ShopItem))
        return list(result.scalars().all())
