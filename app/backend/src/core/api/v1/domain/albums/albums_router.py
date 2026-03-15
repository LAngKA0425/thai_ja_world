from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.albums.albums_schema import (
    AlbumResponse,
    AlbumListResponse,
    PhotoListResponse,
    AlbumCreateRequest,
    AlbumPrivacyUpdateRequest,
)
from src.core.api.v1.domain.albums.albums_service import AlbumsService

router = APIRouter(prefix="/albums", tags=["albums"])


@router.get("/{owner_id}", response_model=AlbumListResponse)
async def get_albums(
    owner_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = AlbumsService(db)
    return await service.get_albums(owner_id)


@router.post("/create", response_model=AlbumResponse)
async def create_album(
    body: AlbumCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AlbumsService(db)
    return await service.create_album(current_user.id, body.title, body.description, body.is_public)


@router.patch("/{album_id}/privacy", response_model=AlbumResponse)
async def update_album_privacy(
    album_id: uuid.UUID,
    body: AlbumPrivacyUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AlbumsService(db)
    return await service.update_privacy(album_id, body.is_public)


@router.delete("/{album_id}")
async def delete_album(
    album_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AlbumsService(db)
    success = await service.delete_album(album_id)
    return {"success": success}


@router.get("/photos/{album_id}", response_model=PhotoListResponse)
async def get_photos(
    album_id: uuid.UUID,
    page: int = Query(1, ge=1),
    db: AsyncSession = Depends(get_db),
):
    service = AlbumsService(db)
    return await service.get_photos(album_id, page)


@router.delete("/photos/{photo_id}")
async def delete_photo(
    photo_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AlbumsService(db)
    success = await service.delete_photo(photo_id)
    return {"success": success}
