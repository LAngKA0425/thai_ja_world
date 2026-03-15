from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.infra.db import Base


class Album(Base):
    __tablename__ = "albums"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    album_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("albums.id"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str] = mapped_column(Text, nullable=False, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class AlbumsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_albums_by_owner(self, owner_id: uuid.UUID) -> list[Album]:
        stmt = (
            select(Album)
            .where(Album.owner_id == owner_id)
            .order_by(Album.sort_order, Album.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_album(self, album_id: uuid.UUID) -> Album | None:
        result = await self.db.execute(select(Album).where(Album.id == album_id))
        return result.scalar_one_or_none()

    async def create_album(
        self, owner_id: uuid.UUID, title: str, description: str, is_public: bool
    ) -> Album:
        album = Album(
            owner_id=owner_id,
            title=title,
            description=description,
            is_public=is_public,
        )
        self.db.add(album)
        await self.db.flush()
        await self.db.refresh(album)
        return album

    async def update_privacy(self, album_id: uuid.UUID, is_public: bool) -> Album | None:
        album = await self.get_album(album_id)
        if not album:
            return None
        album.is_public = is_public
        await self.db.flush()
        return album

    async def delete_album(self, album_id: uuid.UUID) -> bool:
        album = await self.get_album(album_id)
        if not album:
            return False
        await self.db.delete(album)
        await self.db.flush()
        return True

    async def get_photos(self, album_id: uuid.UUID, page: int = 1, page_size: int = 20) -> tuple[list[Photo], int]:
        count_stmt = select(func.count()).select_from(Photo).where(Photo.album_id == album_id)
        total = (await self.db.execute(count_stmt)).scalar_one()

        stmt = (
            select(Photo)
            .where(Photo.album_id == album_id)
            .order_by(Photo.sort_order, Photo.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), total

    async def add_photo(self, album_id: uuid.UUID, image_url: str, caption: str) -> Photo:
        photo = Photo(album_id=album_id, image_url=image_url, caption=caption)
        self.db.add(photo)
        await self.db.flush()
        await self.db.refresh(photo)
        return photo

    async def delete_photo(self, photo_id: uuid.UUID) -> bool:
        result = await self.db.execute(select(Photo).where(Photo.id == photo_id))
        photo = result.scalar_one_or_none()
        if not photo:
            return False
        await self.db.delete(photo)
        await self.db.flush()
        return True

    async def count_photos_in_album(self, album_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Photo).where(Photo.album_id == album_id)
        )
        return result.scalar_one()
