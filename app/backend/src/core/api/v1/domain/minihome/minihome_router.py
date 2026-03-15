from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user, require_admin
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.minihome.minihome_schema import (
    MinihomeProfileResponse,
    MinihomeHandleResolveResponse,
    MinihomeCreateRequest,
    GuestbookEntryResponse,
    GuestbookWriteRequest,
    AlbumItemResponse,
    MinihomeAdminSummaryResponse,
    BgmResponse,
    BgmListResponse,
    SetRepresentativeBgmRequest,
)
from src.core.api.v1.domain.minihome.minihome_service import MinihomeService

router = APIRouter(prefix="/minihome", tags=["minihome"])


@router.get("/resolve/{handle}", response_model=MinihomeHandleResolveResponse)
async def resolve_minihome_handle(
    handle: str,
    db: AsyncSession = Depends(get_db),
):
    normalized = handle.lstrip("@").strip()
    if not normalized:
        from src.core.errors import bad_request
        raise bad_request("INVALID_HANDLE", "미니홈피 핸들이 비어 있습니다")

    try:
        user_id = uuid.UUID(normalized)
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            from src.core.errors import not_found
            raise not_found("해당 사용자 ID를 찾을 수 없습니다")
        return MinihomeHandleResolveResponse(
            handle=handle,
            resolved_by="user_id",
            user_id=user.id,
            nickname=user.nickname,
        )
    except ValueError:
        pass

    result = await db.execute(select(User).where(User.nickname == normalized))
    user = result.scalar_one_or_none()
    if not user:
        from src.core.errors import not_found
        raise not_found("해당 닉네임을 찾을 수 없습니다")
    return MinihomeHandleResolveResponse(
        handle=handle,
        resolved_by="nickname",
        user_id=user.id,
        nickname=user.nickname,
    )


@router.get("/{user_id}", response_model=MinihomeProfileResponse)
async def get_minihome_profile(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = MinihomeService(db)
    return await service.get_profile(user_id)


@router.post("/", response_model=MinihomeProfileResponse, status_code=201)
async def create_minihome(
    body: MinihomeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MinihomeService(db)
    title = body.title or f"{current_user.nickname}의 미니홈피"
    description = body.description or ""
    return await service.create_profile(current_user.id, current_user.nickname, title, description, body.skin_id)


@router.get("/{user_id}/guestbook", response_model=list[GuestbookEntryResponse])
async def get_guestbook(
    user_id: uuid.UUID,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    service = MinihomeService(db)
    return await service.get_guestbook(user_id, limit, offset)


@router.post("/{user_id}/guestbook", response_model=GuestbookEntryResponse, status_code=201)
async def write_guestbook(
    user_id: uuid.UUID,
    body: GuestbookWriteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MinihomeService(db)
    return await service.write_guestbook(user_id, current_user.id, current_user.nickname, body.content, body.is_secret)


@router.get("/{user_id}/album", response_model=list[AlbumItemResponse])
async def get_album(
    user_id: uuid.UUID,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    service = MinihomeService(db)
    return await service.get_album(user_id, limit, offset)


@router.post("/{user_id}/visit", status_code=200)
async def record_visit(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MinihomeService(db)
    recorded = await service.record_visit(user_id, current_user.id)
    return {"ok": True, "recorded": recorded}


@router.get("/{user_id}/bgm", response_model=BgmListResponse)
async def get_bgm_list(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = MinihomeService(db)
    items = await service.get_bgm_list(user_id)
    return BgmListResponse(items=items, total=len(items))


@router.get("/{user_id}/bgm/representative", response_model=BgmResponse | None)
async def get_representative_bgm(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = MinihomeService(db)
    return await service.get_representative_bgm(user_id)


@router.put("/{user_id}/bgm/representative", response_model=BgmResponse)
async def set_representative_bgm(
    user_id: uuid.UUID,
    body: SetRepresentativeBgmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.id != user_id:
        from src.core.errors import forbidden
        raise forbidden("자신의 미니홈피 BGM만 변경할 수 있습니다")
    service = MinihomeService(db)
    return await service.set_representative_bgm(user_id, body.bgm_id)


@router.get("/admin/summary", response_model=MinihomeAdminSummaryResponse)
async def get_admin_summary(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = MinihomeService(db)
    summary = await service.get_admin_summary()
    return MinihomeAdminSummaryResponse(
        total_minihomes=summary["total_minihomes"],
        active_today=summary["active_today"],
        total_guestbook_entries=summary["total_guestbook_entries"],
        total_visits_today=summary["total_visits_today"],
    )
