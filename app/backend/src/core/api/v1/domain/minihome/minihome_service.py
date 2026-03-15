from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.api.v1.domain.minihome.minihome_repository import (
    MinihomeRepository,
    MinihomeProfile,
    GuestbookEntry,
    MinihomeAlbum,
    MinihomeBgm,
)
from src.core.errors import not_found, bad_request
from src.core.api.v1.domain.models.user import User


class MinihomeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = MinihomeRepository(db)

    async def get_profile(self, user_id: uuid.UUID) -> MinihomeProfile:
        profile = await self.repository.get_profile(user_id)
        if not profile:
            raise not_found("Minihome profile not found")
        return profile

    async def _ensure_profile_exists(self, user_id: uuid.UUID) -> MinihomeProfile:
        profile = await self.repository.get_profile(user_id)
        if profile:
            return profile

        user_result = await self.db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            raise not_found("User not found")

        return await self.repository.create_profile(
            user_id=user.id,
            owner_nickname=user.nickname,
            title=f"{user.nickname}의 미니홈피",
            description="",
            skin_id="default",
        )

    async def create_profile(
        self,
        user_id: uuid.UUID,
        owner_nickname: str,
        title: str,
        description: str,
        skin_id: str = "default",
        bgm_url: str | None = None,
    ) -> MinihomeProfile:
        existing = await self.repository.get_profile(user_id)
        if existing:
            raise bad_request("MINIHOME_EXISTS", "Minihome already exists for this user")
        return await self.repository.create_profile(user_id, owner_nickname, title, description, skin_id, bgm_url)

    async def update_profile(
        self,
        user_id: uuid.UUID,
        title: str | None = None,
        description: str | None = None,
        skin_id: str | None = None,
        bgm_url: str | None = None,
    ) -> MinihomeProfile:
        await self._ensure_profile_exists(user_id)
        profile = await self.repository.update_profile(user_id, title, description, skin_id, bgm_url)
        if not profile:
            raise not_found("Minihome profile not found")
        return profile

    async def write_guestbook(
        self,
        minihome_user_id: uuid.UUID,
        author_id: uuid.UUID,
        author_nickname: str,
        content: str,
        is_secret: bool = False,
    ) -> GuestbookEntry:
        profile = await self.repository.get_profile(minihome_user_id)
        if not profile:
            raise not_found("Minihome profile not found")
        return await self.repository.add_guestbook_entry(minihome_user_id, author_id, author_nickname, content, is_secret)

    async def get_guestbook(self, minihome_user_id: uuid.UUID, limit: int = 50, offset: int = 0) -> list[GuestbookEntry]:
        profile = await self.repository.get_profile(minihome_user_id)
        if not profile:
            raise not_found("Minihome profile not found")
        return await self.repository.get_guestbook_entries(minihome_user_id, limit, offset)

    async def record_visit(self, minihome_user_id: uuid.UUID, visitor_id: uuid.UUID) -> bool:
        profile = await self.repository.get_profile(minihome_user_id)
        if not profile:
            raise not_found("Minihome profile not found")

        # Check if same user visiting within cooldown
        if minihome_user_id == visitor_id:
            raise bad_request("CANNOT_VISIT_OWN", "Cannot visit your own minihome")

        last_visit = await self.repository.get_last_visit(minihome_user_id, visitor_id)
        if last_visit:
            cooldown_minutes = 10
            elapsed = datetime.now(timezone.utc) - last_visit.visited_at
            if elapsed < timedelta(minutes=cooldown_minutes):
                return False

        await self.repository.record_visit(minihome_user_id, visitor_id)
        return True

    async def get_album(self, user_id: uuid.UUID, limit: int = 20, offset: int = 0) -> list[MinihomeAlbum]:
        profile = await self.repository.get_profile(user_id)
        if not profile:
            raise not_found("Minihome profile not found")
        return await self.repository.get_album_items(user_id, limit, offset)

    async def add_album_item(self, user_id: uuid.UUID, image_url: str, caption: str | None = None) -> MinihomeAlbum:
        profile = await self.repository.get_profile(user_id)
        if not profile:
            raise not_found("Minihome profile not found")
        return await self.repository.add_album_item(user_id, image_url, caption)

    # ── BGM ──

    async def get_bgm_list(self, user_id: uuid.UUID) -> list[MinihomeBgm]:
        return await self.repository.get_user_bgm_list(user_id)

    async def get_representative_bgm(self, user_id: uuid.UUID) -> MinihomeBgm | None:
        return await self.repository.get_representative_bgm(user_id)

    async def set_representative_bgm(self, user_id: uuid.UUID, bgm_id: uuid.UUID) -> MinihomeBgm:
        bgm = await self.repository.set_representative_bgm(user_id, bgm_id)
        if not bgm:
            raise not_found("BGM not found or not owned by user")
        return bgm

    async def add_bgm(
        self,
        user_id: uuid.UUID,
        title: str,
        artist: str | None,
        url: str,
        shop_item_id: uuid.UUID | None = None,
        purchase_id: uuid.UUID | None = None,
        is_representative: bool = False,
    ) -> MinihomeBgm:
        await self._ensure_profile_exists(user_id)
        return await self.repository.add_bgm(user_id, title, artist, url, shop_item_id, purchase_id, is_representative)

    async def delete_bgm(self, user_id: uuid.UUID, bgm_id: uuid.UUID) -> bool:
        deleted = await self.repository.delete_bgm(bgm_id, user_id)
        if not deleted:
            raise not_found("BGM not found or not owned by user")
        return True

    async def get_admin_summary(self) -> dict:
        total_minihomes = await self.repository.count_all_minihomes()
        total_guestbook_entries = await self.repository.count_guestbook_entries()

        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        from sqlalchemy import select, func
        from src.core.api.v1.domain.minihome.minihome_repository import MinihomeVisitLog

        active_today_result = await self.db.execute(
            select(func.count(func.distinct(MinihomeVisitLog.minihome_user_id)))
            .select_from(MinihomeVisitLog)
            .where(MinihomeVisitLog.visited_at >= today_start)
        )
        active_today = active_today_result.scalar_one() or 0

        total_visits_today_result = await self.db.execute(
            select(func.count()).select_from(MinihomeVisitLog)
            .where(MinihomeVisitLog.visited_at >= today_start)
        )
        total_visits_today = total_visits_today_result.scalar_one() or 0

        return {
            "total_minihomes": total_minihomes,
            "active_today": active_today,
            "total_guestbook_entries": total_guestbook_entries,
            "total_visits_today": total_visits_today,
        }
