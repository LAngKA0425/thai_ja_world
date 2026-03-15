from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MinihomeProfileResponse(BaseModel):
    user_id: uuid.UUID
    owner_nickname: str
    title: str
    description: str
    skin_id: str
    bgm_url: str | None
    today_visitors: int
    total_visitors: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MinihomeHandleResolveResponse(BaseModel):
    handle: str
    resolved_by: str
    user_id: uuid.UUID
    nickname: str

    model_config = {"from_attributes": True}


class GuestbookEntryResponse(BaseModel):
    id: uuid.UUID
    minihome_owner_id: uuid.UUID = Field(validation_alias="minihome_user_id")
    author_id: uuid.UUID
    author_nickname: str
    content: str
    is_secret: bool
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


class GuestbookWriteRequest(BaseModel):
    content: str
    is_secret: bool = False


class AlbumItemResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    image_url: str
    caption: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BgmResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    artist: str | None
    url: str
    is_representative: bool
    sort_order: int
    shop_item_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BgmListResponse(BaseModel):
    items: list[BgmResponse]
    total: int


class SetRepresentativeBgmRequest(BaseModel):
    bgm_id: uuid.UUID


class VisitStatsResponse(BaseModel):
    today_visitors: int
    total_visitors: int
    last_visited_at: datetime | None


class MinihomeCreateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    skin_id: str = "default"


class MinihomeAdminSummaryResponse(BaseModel):
    total_minihomes: int
    active_today: int
    total_guestbook_entries: int
    total_visits_today: int
