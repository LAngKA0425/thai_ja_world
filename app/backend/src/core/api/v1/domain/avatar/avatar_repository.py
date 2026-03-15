from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.infra.db import Base


class AvatarItem(Base):
    __tablename__ = "avatar_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(String(30), nullable=False, index=True)  # hair, top, bottom, accessory
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    preview_color: Mapped[str] = mapped_column(String(30), nullable=False, default="#888888")
    preview_image: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rarity: Mapped[str | None] = mapped_column(String(20), nullable=True)  # common, rare, epic, legendary
    price_tp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    duration_type: Mapped[str] = mapped_column(String(20), nullable=False, default="permanent")  # permanent, timed
    duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserAvatarInventory(Base):
    __tablename__ = "user_avatar_inventory"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("avatar_items.id"), nullable=False)
    owned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_equipped: Mapped[bool] = mapped_column(Boolean, default=False)


class AvatarRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── 아이템 조회 ──

    async def get_all_items(self, active_only: bool = True) -> list[AvatarItem]:
        stmt = select(AvatarItem).order_by(AvatarItem.created_at.desc())
        if active_only:
            stmt = stmt.where(AvatarItem.is_active == True)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_items_by_category(self, category: str, active_only: bool = True) -> list[AvatarItem]:
        stmt = select(AvatarItem).where(AvatarItem.category == category).order_by(AvatarItem.created_at.desc())
        if active_only:
            stmt = stmt.where(AvatarItem.is_active == True)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_item(self, item_id: uuid.UUID) -> AvatarItem | None:
        result = await self.db.execute(select(AvatarItem).where(AvatarItem.id == item_id))
        return result.scalar_one_or_none()

    async def count_all_items(self) -> int:
        result = await self.db.execute(select(func.count()).select_from(AvatarItem))
        return result.scalar_one()

    async def count_by_category(self) -> dict[str, int]:
        result = await self.db.execute(
            select(AvatarItem.category, func.count())
            .select_from(AvatarItem)
            .group_by(AvatarItem.category)
        )
        return {row[0]: row[1] for row in result.all()}

    # ── 인벤토리 ──

    async def get_user_inventory(self, user_id: uuid.UUID) -> list[UserAvatarInventory]:
        result = await self.db.execute(
            select(UserAvatarInventory)
            .where(UserAvatarInventory.user_id == user_id)
            .order_by(UserAvatarInventory.owned_at.desc())
        )
        return list(result.scalars().all())

    async def get_equipped_items(self, user_id: uuid.UUID) -> list[UserAvatarInventory]:
        result = await self.db.execute(
            select(UserAvatarInventory)
            .where(
                UserAvatarInventory.user_id == user_id,
                UserAvatarInventory.is_equipped == True,
            )
        )
        return list(result.scalars().all())

    async def add_to_inventory(
        self,
        user_id: uuid.UUID,
        item_id: uuid.UUID,
        expires_at: datetime | None = None,
    ) -> UserAvatarInventory:
        entry = UserAvatarInventory(
            user_id=user_id,
            item_id=item_id,
            expires_at=expires_at,
        )
        self.db.add(entry)
        await self.db.flush()
        await self.db.refresh(entry)
        return entry

    async def equip_item(self, user_id: uuid.UUID, inventory_id: uuid.UUID, category: str) -> None:
        # 같은 카테고리의 기존 장착 해제
        equipped = await self.db.execute(
            select(UserAvatarInventory)
            .where(
                UserAvatarInventory.user_id == user_id,
                UserAvatarInventory.is_equipped == True,
            )
        )
        for inv in equipped.scalars().all():
            item = await self.get_item(inv.item_id)
            if item and item.category == category:
                inv.is_equipped = False

        # 새 아이템 장착
        result = await self.db.execute(
            select(UserAvatarInventory).where(UserAvatarInventory.id == inventory_id)
        )
        inv_item = result.scalar_one_or_none()
        if inv_item:
            inv_item.is_equipped = True

        await self.db.flush()

    async def unequip_category(self, user_id: uuid.UUID, category: str) -> None:
        equipped = await self.db.execute(
            select(UserAvatarInventory)
            .where(
                UserAvatarInventory.user_id == user_id,
                UserAvatarInventory.is_equipped == True,
            )
        )
        for inv in equipped.scalars().all():
            item = await self.get_item(inv.item_id)
            if item and item.category == category:
                inv.is_equipped = False

        await self.db.flush()
