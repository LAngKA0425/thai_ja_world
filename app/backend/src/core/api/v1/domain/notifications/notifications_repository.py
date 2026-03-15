from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.infra.db import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class NotificationsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_notifications(
        self, user_id: uuid.UUID, page: int = 1, page_size: int = 20
    ) -> tuple[list[Notification], int]:
        count_stmt = (
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id)
        )
        total = (await self.db.execute(count_stmt)).scalar_one()

        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), total

    async def count_unread(self, user_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
        )
        return result.scalar_one()

    async def mark_as_read(self, notification_id: uuid.UUID) -> bool:
        result = await self.db.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        notif = result.scalar_one_or_none()
        if not notif:
            return False
        notif.is_read = True
        await self.db.flush()
        return True

    async def create_notification(
        self, user_id: uuid.UUID, type_: str, title: str, message: str
    ) -> Notification:
        notif = Notification(user_id=user_id, type=type_, title=title, message=message)
        self.db.add(notif)
        await self.db.flush()
        await self.db.refresh(notif)
        return notif
