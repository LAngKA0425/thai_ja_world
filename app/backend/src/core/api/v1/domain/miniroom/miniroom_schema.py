from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class MiniroomObjectResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    item_type: str  # furniture, decoration, pet, background, trash_quest
    name: str
    image_url: str
    position_x: int
    position_y: int
    is_interactable: bool
    interaction_type: str | None  # click, hover, etc.

    model_config = {"from_attributes": True}


class MiniroomStateResponse(BaseModel):
    user_id: uuid.UUID
    objects: list[MiniroomObjectResponse]
    trash_quest_available: bool


class TrashQuestInteractionRequest(BaseModel):
    object_id: uuid.UUID


class TrashQuestInteractionResponse(BaseModel):
    success: bool
    points_earned: int
    message: str
