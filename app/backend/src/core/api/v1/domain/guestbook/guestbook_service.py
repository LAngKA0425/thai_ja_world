from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select

from src.core.api.v1.domain.guestbook.guestbook_repository import (
    GuestbookRepository,
    GuestbookEntry,
)
from src.core.api.v1.domain.models.user import User
from src.core.errors import not_found, bad_request, forbidden


class GuestbookService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = GuestbookRepository(db)

    async def get_entries(
        self, owner_id: uuid.UUID, page: int = 1, page_size: int = 10
    ) -> dict:
        owner = await self.db.execute(select(User).where(User.id == owner_id))
        if not owner.scalar_one_or_none():
            raise not_found("Minihome owner not found")
        entries, total = await self.repository.get_entries(owner_id, page, page_size)
        return {"entries": entries, "total": total, "page": page, "page_size": page_size}

    async def write_entry(
        self, owner_id: uuid.UUID, author_id: uuid.UUID, content: str
    ) -> GuestbookEntry:
        if not content.strip():
            raise bad_request("EMPTY_CONTENT", "Content cannot be empty")
        owner_result = await self.db.execute(select(User).where(User.id == owner_id))
        if not owner_result.scalar_one_or_none():
            raise not_found("Minihome owner not found")

        result = await self.db.execute(select(User).where(User.id == author_id))
        author = result.scalar_one_or_none()
        if not author:
            raise not_found("Author not found")
        author_nickname = author.nickname
        return await self.repository.create_entry(owner_id, author_id, author_nickname, content)

    async def delete_entry(self, entry_id: uuid.UUID, requester_id: uuid.UUID) -> bool:
        entry = await self.repository.get_entry(entry_id)
        if not entry:
            raise not_found("Guestbook entry not found")
        if entry.author_id != requester_id and entry.minihome_user_id != requester_id:
            raise forbidden("Owner or author only")

        success = await self.repository.soft_delete(entry_id)
        if not success:
            raise not_found("Guestbook entry not found")
        return True
