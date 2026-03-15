from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class GuestbookEntryResponse(BaseModel):
    id: uuid.UUID
    minihome_owner_id: uuid.UUID = Field(validation_alias="minihome_user_id")
    author_id: uuid.UUID
    author_nickname: str
    content: str
    is_secret: bool
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


class GuestbookListResponse(BaseModel):
    entries: list[GuestbookEntryResponse]
    total: int
    page: int
    page_size: int


class GuestbookWriteRequest(BaseModel):
    minihome_owner_id: uuid.UUID
    content: str


class GuestbookDeleteResponse(BaseModel):
    success: bool
