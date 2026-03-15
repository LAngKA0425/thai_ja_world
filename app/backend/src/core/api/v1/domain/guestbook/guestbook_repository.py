from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.minihome.minihome_repository import GuestbookEntry


class GuestbookRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_entries(
        self, owner_id: uuid.UUID, page: int = 1, page_size: int = 10
    ) -> tuple[list[GuestbookEntry], int]:
        count_stmt = (
            select(func.count())
            .select_from(GuestbookEntry)
            .where(
                GuestbookEntry.minihome_user_id == owner_id,
            )
        )
        total = (await self.db.execute(count_stmt)).scalar_one()

        stmt = (
            select(GuestbookEntry)
            .where(
                GuestbookEntry.minihome_user_id == owner_id,
            )
            .order_by(GuestbookEntry.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), total

    async def create_entry(
        self, owner_id: uuid.UUID, author_id: uuid.UUID, author_nickname: str, content: str
    ) -> GuestbookEntry:
        entry = GuestbookEntry(
            minihome_user_id=owner_id,
            author_id=author_id,
            author_nickname=author_nickname,
            content=content,
        )
        self.db.add(entry)
        await self.db.flush()
        await self.db.refresh(entry)
        return entry

    async def get_entry(self, entry_id: uuid.UUID) -> GuestbookEntry | None:
        result = await self.db.execute(
            select(GuestbookEntry).where(GuestbookEntry.id == entry_id)
        )
        return result.scalar_one_or_none()

    async def soft_delete(self, entry_id: uuid.UUID) -> bool:
        entry = await self.get_entry(entry_id)
        if not entry:
            return False
        await self.db.delete(entry)
        await self.db.flush()
        return True
