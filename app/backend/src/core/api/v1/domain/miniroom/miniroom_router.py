from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.miniroom.miniroom_schema import (
    MiniroomObjectResponse,
    MiniroomStateResponse,
    TrashQuestInteractionRequest,
    TrashQuestInteractionResponse,
)
from src.core.api.v1.domain.miniroom.miniroom_service import MiniroomService

router = APIRouter(prefix="/miniroom", tags=["miniroom"])


@router.get("/{user_id}", response_model=MiniroomStateResponse)
async def get_room_state(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = MiniroomService(db)
    state = await service.get_room_state(user_id)
    return MiniroomStateResponse(
        user_id=state["user_id"],
        objects=[MiniroomObjectResponse.model_validate(obj) for obj in state["objects"]],
        trash_quest_available=state["trash_quest_available"],
    )


@router.post("/{user_id}/interact", response_model=dict, status_code=200)
async def interact_with_object(
    user_id: uuid.UUID,
    body: TrashQuestInteractionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MiniroomService(db)
    result = await service.interact_with_object(body.object_id, current_user.id)
    return result
