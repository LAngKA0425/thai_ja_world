from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class AlbumResponse(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    title: str
    description: str
    is_public: bool
    sort_order: int
    photo_count: int
    cover_image_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PhotoResponse(BaseModel):
    id: uuid.UUID
    album_id: uuid.UUID
    image_url: str
    caption: str
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AlbumListResponse(BaseModel):
    albums: list[AlbumResponse]
    total: int


class PhotoListResponse(BaseModel):
    photos: list[PhotoResponse]
    total: int


class AlbumCreateRequest(BaseModel):
    title: str
    description: str = ""
    is_public: bool = True


class AlbumPrivacyUpdateRequest(BaseModel):
    is_public: bool
