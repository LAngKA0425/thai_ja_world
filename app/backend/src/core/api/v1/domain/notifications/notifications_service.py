from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.notifications.notifications_repository import (
    NotificationsRepository,
    Notification,
)
from src.core.errors import not_found


class NotificationsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = NotificationsRepository(db)

    async def get_notifications(self, user_id: uuid.UUID, page: int = 1) -> dict:
        notifications, total = await self.repository.get_user_notifications(user_id, page)
        unread_count = await self.repository.count_unread(user_id)
        return {
            "notifications": notifications,
            "total": total,
            "unread_count": unread_count,
        }

    async def mark_as_read(self, notification_id: uuid.UUID) -> bool:
        success = await self.repository.mark_as_read(notification_id)
        if not success:
            raise not_found("Notification not found")
        return True

    async def create_notification(
        self, user_id: uuid.UUID, type_: str, title: str, message: str
    ) -> Notification:
        return await self.repository.create_notification(user_id, type_, title, message)
