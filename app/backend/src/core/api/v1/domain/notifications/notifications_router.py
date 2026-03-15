from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.notifications.notifications_schema import (
    NotificationListResponse,
)
from src.core.api.v1.domain.notifications.notifications_service import NotificationsService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    page: int = Query(1, ge=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationsService(db)
    return await service.get_notifications(current_user.id, page)


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationsService(db)
    success = await service.mark_as_read(notification_id)
    return {"success": success}
