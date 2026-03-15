from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.infra.db import Base


class MiniroomObject(Base):
    __tablename__ = "miniroom_objects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    item_type: Mapped[str] = mapped_column(String(50), nullable=False)  # furniture, decoration, pet, background, trash_quest
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    position_x: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    position_y: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_interactable: Mapped[bool] = mapped_column(Boolean, default=False)
    interaction_type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # click, hover, etc.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MiniroomInteractionLog(Base):
    __tablename__ = "miniroom_interaction_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    object_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("miniroom_objects.id"), nullable=False, index=True)
    visitor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    interaction_type: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MiniroomRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_objects_for_user(self, user_id: uuid.UUID) -> list[MiniroomObject]:
        result = await self.db.execute(
            select(MiniroomObject)
            .where(MiniroomObject.user_id == user_id)
            .order_by(MiniroomObject.created_at)
        )
        return list(result.scalars().all())

    async def get_object(self, object_id: uuid.UUID) -> MiniroomObject | None:
        result = await self.db.execute(select(MiniroomObject).where(MiniroomObject.id == object_id))
        return result.scalar_one_or_none()

    async def create_object(
        self,
        user_id: uuid.UUID,
        item_type: str,
        name: str,
        image_url: str,
        position_x: int = 0,
        position_y: int = 0,
        is_interactable: bool = False,
        interaction_type: str | None = None,
    ) -> MiniroomObject:
        obj = MiniroomObject(
            user_id=user_id,
            item_type=item_type,
            name=name,
            image_url=image_url,
            position_x=position_x,
            position_y=position_y,
            is_interactable=is_interactable,
            interaction_type=interaction_type,
        )
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update_object_position(self, object_id: uuid.UUID, position_x: int, position_y: int) -> MiniroomObject | None:
        result = await self.db.execute(select(MiniroomObject).where(MiniroomObject.id == object_id))
        obj = result.scalar_one_or_none()
        if not obj:
            return None
        obj.position_x = position_x
        obj.position_y = position_y
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def log_interaction(self, object_id: uuid.UUID, visitor_id: uuid.UUID, interaction_type: str) -> MiniroomInteractionLog:
        log = MiniroomInteractionLog(object_id=object_id, visitor_id=visitor_id, interaction_type=interaction_type)
        self.db.add(log)
        await self.db.flush()
        await self.db.refresh(log)
        return log

    async def delete_object(self, object_id: uuid.UUID) -> bool:
        result = await self.db.execute(select(MiniroomObject).where(MiniroomObject.id == object_id))
        obj = result.scalar_one_or_none()
        if not obj:
            return False
        await self.db.delete(obj)
        return True
