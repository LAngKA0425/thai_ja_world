from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.infra.db import Base
from src.core.api.v1.domain.shop.shop_repository import PurchaseLog


class MinihomeProfile(Base):
    __tablename__ = "minihome_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True, nullable=False)
    owner_nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    skin_id: Mapped[str] = mapped_column(String(50), nullable=False, default="default")
    bgm_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    today_visitors: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_visitors: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class GuestbookEntry(Base):
    __tablename__ = "guestbook_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    minihome_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    author_nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_secret: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MinihomeAlbum(Base):
    __tablename__ = "minihome_albums"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MinihomeVisitLog(Base):
    __tablename__ = "minihome_visit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    minihome_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    visitor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    visited_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MinihomeBgm(Base):
    __tablename__ = "minihome_bgm"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    artist: Mapped[str | None] = mapped_column(String(100), nullable=True)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_representative: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    shop_item_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("shop_items.id"), nullable=True)
    purchase_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("purchase_logs.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MinihomeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, user_id: uuid.UUID) -> MinihomeProfile | None:
        result = await self.db.execute(select(MinihomeProfile).where(MinihomeProfile.user_id == user_id))
        return result.scalar_one_or_none()

    async def create_profile(
        self,
        user_id: uuid.UUID,
        owner_nickname: str,
        title: str,
        description: str,
        skin_id: str = "default",
        bgm_url: str | None = None,
    ) -> MinihomeProfile:
        profile = MinihomeProfile(
            user_id=user_id,
            owner_nickname=owner_nickname,
            title=title,
            description=description,
            skin_id=skin_id,
            bgm_url=bgm_url,
        )
        self.db.add(profile)
        await self.db.flush()
        await self.db.refresh(profile)
        return profile

    async def update_profile(
        self,
        user_id: uuid.UUID,
        title: str | None = None,
        description: str | None = None,
        skin_id: str | None = None,
        bgm_url: str | None = None,
    ) -> MinihomeProfile | None:
        result = await self.db.execute(select(MinihomeProfile).where(MinihomeProfile.user_id == user_id))
        profile = result.scalar_one_or_none()
        if not profile:
            return None
        if title is not None:
            profile.title = title
        if description is not None:
            profile.description = description
        if skin_id is not None:
            profile.skin_id = skin_id
        if bgm_url is not None:
            profile.bgm_url = bgm_url
        await self.db.flush()
        await self.db.refresh(profile)
        return profile

    async def add_guestbook_entry(
        self,
        minihome_user_id: uuid.UUID,
        author_id: uuid.UUID,
        author_nickname: str,
        content: str,
        is_secret: bool = False,
    ) -> GuestbookEntry:
        entry = GuestbookEntry(
            minihome_user_id=minihome_user_id,
            author_id=author_id,
            author_nickname=author_nickname,
            content=content,
            is_secret=is_secret,
        )
        self.db.add(entry)
        await self.db.flush()
        await self.db.refresh(entry)
        return entry

    async def get_guestbook_entries(self, minihome_user_id: uuid.UUID, limit: int = 50, offset: int = 0) -> list[GuestbookEntry]:
        result = await self.db.execute(
            select(GuestbookEntry)
            .where(GuestbookEntry.minihome_user_id == minihome_user_id)
            .order_by(GuestbookEntry.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def get_album_items(self, user_id: uuid.UUID, limit: int = 20, offset: int = 0) -> list[MinihomeAlbum]:
        result = await self.db.execute(
            select(MinihomeAlbum)
            .where(MinihomeAlbum.user_id == user_id)
            .order_by(MinihomeAlbum.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def add_album_item(self, user_id: uuid.UUID, image_url: str, caption: str | None = None) -> MinihomeAlbum:
        item = MinihomeAlbum(user_id=user_id, image_url=image_url, caption=caption)
        self.db.add(item)
        await self.db.flush()
        await self.db.refresh(item)
        return item

    async def record_visit(self, minihome_user_id: uuid.UUID, visitor_id: uuid.UUID) -> MinihomeVisitLog:
        visit_log = MinihomeVisitLog(minihome_user_id=minihome_user_id, visitor_id=visitor_id)
        self.db.add(visit_log)
        await self.db.flush()
        await self.db.refresh(visit_log)
        return visit_log

    async def get_last_visit(self, minihome_user_id: uuid.UUID, visitor_id: uuid.UUID) -> MinihomeVisitLog | None:
        result = await self.db.execute(
            select(MinihomeVisitLog)
            .where(
                (MinihomeVisitLog.minihome_user_id == minihome_user_id) & (MinihomeVisitLog.visitor_id == visitor_id)
            )
            .order_by(MinihomeVisitLog.visited_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_today_visit_count(self, minihome_user_id: uuid.UUID) -> int:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(func.count()).select_from(MinihomeVisitLog)
            .where(
                (MinihomeVisitLog.minihome_user_id == minihome_user_id) & (MinihomeVisitLog.visited_at >= today_start)
            )
        )
        return result.scalar_one()

    async def get_total_visit_count(self, minihome_user_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MinihomeVisitLog)
            .where(MinihomeVisitLog.minihome_user_id == minihome_user_id)
        )
        return result.scalar_one()

    async def count_all_minihomes(self) -> int:
        result = await self.db.execute(select(func.count()).select_from(MinihomeProfile))
        return result.scalar_one()

    async def count_guestbook_entries(self) -> int:
        result = await self.db.execute(select(func.count()).select_from(GuestbookEntry))
        return result.scalar_one()

    # ── BGM ──

    async def get_user_bgm_list(self, user_id: uuid.UUID) -> list[MinihomeBgm]:
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(MinihomeBgm)
            .outerjoin(PurchaseLog, PurchaseLog.id == MinihomeBgm.purchase_id)
            .where(
                MinihomeBgm.user_id == user_id,
                (MinihomeBgm.purchase_id.is_(None))
                | (PurchaseLog.id.is_(None))
                | (PurchaseLog.expires_at.is_(None))
                | (PurchaseLog.expires_at > now),
            )
            .order_by(MinihomeBgm.sort_order.asc(), MinihomeBgm.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_representative_bgm(self, user_id: uuid.UUID) -> MinihomeBgm | None:
        bgm_list = await self.get_user_bgm_list(user_id)
        representative = next((b for b in bgm_list if b.is_representative), None)
        if representative:
            return representative

        # Fallback is DB-backed valid order (sort_order, created_at).
        return bgm_list[0] if bgm_list else None

    async def set_representative_bgm(self, user_id: uuid.UUID, bgm_id: uuid.UUID) -> MinihomeBgm | None:
        candidate_result = await self.db.execute(
            select(MinihomeBgm)
            .outerjoin(PurchaseLog, PurchaseLog.id == MinihomeBgm.purchase_id)
            .where(
                MinihomeBgm.id == bgm_id,
                MinihomeBgm.user_id == user_id,
                (MinihomeBgm.purchase_id.is_(None))
                | (PurchaseLog.id.is_(None))
                | (PurchaseLog.expires_at.is_(None))
                | (PurchaseLog.expires_at > datetime.now(timezone.utc)),
            )
        )
        candidate = candidate_result.scalar_one_or_none()
        if not candidate:
            return None

        existing = await self.db.execute(
            select(MinihomeBgm)
            .where((MinihomeBgm.user_id == user_id) & (MinihomeBgm.is_representative == True))
        )
        for bgm in existing.scalars().all():
            bgm.is_representative = False

        candidate.is_representative = True
        await self.db.flush()
        await self.db.refresh(candidate)
        return candidate

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
        # 현재 곡 수로 sort_order 결정
        count_result = await self.db.execute(
            select(func.count()).select_from(MinihomeBgm).where(MinihomeBgm.user_id == user_id)
        )
        count = count_result.scalar_one()

        bgm = MinihomeBgm(
            user_id=user_id,
            title=title,
            artist=artist,
            url=url,
            shop_item_id=shop_item_id,
            purchase_id=purchase_id,
            is_representative=is_representative,
            sort_order=count,
        )
        self.db.add(bgm)
        await self.db.flush()
        await self.db.refresh(bgm)
        return bgm

    async def delete_bgm(self, bgm_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.db.execute(
            select(MinihomeBgm).where((MinihomeBgm.id == bgm_id) & (MinihomeBgm.user_id == user_id))
        )
        bgm = result.scalar_one_or_none()
        if not bgm:
            return False
        await self.db.delete(bgm)
        await self.db.flush()
        return True
