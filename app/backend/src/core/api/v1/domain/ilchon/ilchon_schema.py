from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class IlchonRelationResponse(BaseModel):
    id: uuid.UUID
    requester_id: uuid.UUID
    requester_nickname: str
    receiver_id: uuid.UUID
    receiver_nickname: str
    status: str  # pending, accepted, rejected
    ilchon_comment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class IlchonListResponse(BaseModel):
    relations: list[IlchonRelationResponse]
    total: int


class IlchonRequestPayload(BaseModel):
    receiver_id: uuid.UUID
    ilchon_comment: str | None = None


class IlchonRelationStatusResponse(BaseModel):
    status: str  # none, self, pending, accepted, rejected
    relation_id: uuid.UUID | None
    direction: str | None  # incoming, outgoing
