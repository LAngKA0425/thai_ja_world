from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.albums.albums_repository import (
    AlbumsRepository,
    Album,
    Photo,
)
from src.core.errors import not_found, bad_request


class AlbumsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = AlbumsRepository(db)

    async def get_albums(self, owner_id: uuid.UUID) -> dict:
        albums = await self.repository.get_albums_by_owner(owner_id)
        album_responses = []
        for album in albums:
            photo_count = await self.repository.count_photos_in_album(album.id)
            album_responses.append({
                "album": album,
                "photo_count": photo_count,
            })
        return {"albums": albums, "total": len(albums)}

    async def create_album(
        self, owner_id: uuid.UUID, title: str, description: str, is_public: bool
    ) -> Album:
        if not title.strip():
            raise bad_request("EMPTY_TITLE", "Album title cannot be empty")
        return await self.repository.create_album(owner_id, title, description, is_public)

    async def update_privacy(self, album_id: uuid.UUID, is_public: bool) -> Album:
        album = await self.repository.update_privacy(album_id, is_public)
        if not album:
            raise not_found("Album not found")
        return album

    async def delete_album(self, album_id: uuid.UUID) -> bool:
        success = await self.repository.delete_album(album_id)
        if not success:
            raise not_found("Album not found")
        return True

    async def get_photos(self, album_id: uuid.UUID, page: int = 1) -> dict:
        photos, total = await self.repository.get_photos(album_id, page)
        return {"photos": photos, "total": total}

    async def add_photo(self, album_id: uuid.UUID, image_url: str, caption: str) -> Photo:
        return await self.repository.add_photo(album_id, image_url, caption)

    async def delete_photo(self, photo_id: uuid.UUID) -> bool:
        success = await self.repository.delete_photo(photo_id)
        if not success:
            raise not_found("Photo not found")
        return True
