from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.ilchon.ilchon_schema import (
    IlchonRelationResponse,
    IlchonListResponse,
    IlchonRequestPayload,
    IlchonRelationStatusResponse,
)
from src.core.api.v1.domain.ilchon.ilchon_service import IlchonService

router = APIRouter(prefix="/ilchon", tags=["ilchon"])


@router.get("/status/{target_user_id}", response_model=IlchonRelationStatusResponse)
async def get_relation_status(
    target_user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IlchonService(db)
    return await service.get_relation_status(current_user.id, target_user_id)


@router.get("/{user_id}", response_model=IlchonListResponse)
async def get_ilchon_list(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = IlchonService(db)
    return await service.get_relations(user_id)


@router.post("/request", response_model=IlchonRelationResponse)
async def send_ilchon_request(
    body: IlchonRequestPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IlchonService(db)
    return await service.send_request(current_user.id, body.receiver_id, body.ilchon_comment)


@router.post("/{relation_id}/accept", response_model=IlchonRelationResponse)
async def accept_ilchon_request(
    relation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IlchonService(db)
    return await service.accept_request(relation_id, current_user.id)


@router.post("/{relation_id}/reject")
async def reject_ilchon_request(
    relation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IlchonService(db)
    success = await service.reject_request(relation_id, current_user.id)
    return {"success": success}


@router.delete("/{relation_id}")
async def remove_ilchon(
    relation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IlchonService(db)
    success = await service.remove_ilchon(relation_id, current_user.id)
    return {"success": success}
