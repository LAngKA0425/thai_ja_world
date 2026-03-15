from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.guestbook.guestbook_schema import (
    GuestbookEntryResponse,
    GuestbookListResponse,
    GuestbookWriteRequest,
    GuestbookDeleteResponse,
)
from src.core.api.v1.domain.guestbook.guestbook_service import GuestbookService

router = APIRouter(prefix="/guestbook", tags=["guestbook"])


@router.get("/{owner_id}", response_model=GuestbookListResponse)
async def get_guestbook_entries(
    owner_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    service = GuestbookService(db)
    return await service.get_entries(owner_id, page, page_size)


@router.post("/write", response_model=GuestbookEntryResponse)
async def write_guestbook_entry(
    body: GuestbookWriteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuestbookService(db)
    return await service.write_entry(body.minihome_owner_id, current_user.id, body.content)


@router.delete("/{entry_id}", response_model=GuestbookDeleteResponse)
async def delete_guestbook_entry(
    entry_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GuestbookService(db)
    success = await service.delete_entry(entry_id, current_user.id)
    return GuestbookDeleteResponse(success=success)
