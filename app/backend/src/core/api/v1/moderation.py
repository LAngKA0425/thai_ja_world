from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user, require_moderator
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.moderation import BannedKeyword, Report, UserBlock
from src.core.api.v1.domain.models.post import Comment, Post
from src.core.api.v1.domain.models.user import User
from src.core.errors import bad_request, not_found

router = APIRouter(prefix="/moderation", tags=["moderation"])


# ── Report ───────────────────────────────────────────────────
class ReportCreate(BaseModel):
    target_type: str
    target_id: uuid.UUID
    reason: str


class ReportOut(BaseModel):
    id: uuid.UUID
    reporter_id: uuid.UUID
    target_type: str
    target_id: uuid.UUID
    reason: str
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


class BlockCreate(BaseModel):
    blocked_id: uuid.UUID
    reason: str | None = None


class BlockOut(BaseModel):
    id: uuid.UUID
    blocker_id: uuid.UUID
    blocked_id: uuid.UUID
    reason: str | None
    created_at: datetime
    model_config = {"from_attributes": True}


@router.post("/reports", response_model=ReportOut, status_code=201)
async def create_report(
    body: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.target_type not in ("post", "comment", "user"):
        raise bad_request("INVALID_TARGET", "유효하지 않은 신고 대상입니다")
    report = Report(
        reporter_id=current_user.id,
        target_type=body.target_type,
        target_id=body.target_id,
        reason=body.reason,
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)
    return report


@router.get("/reports", response_model=list[ReportOut])
async def list_reports(
    db: AsyncSession = Depends(get_db),
    _mod: User = Depends(require_moderator),
):
    result = await db.execute(select(Report).order_by(Report.created_at.desc()))
    return list(result.scalars().all())


@router.post("/blocks", response_model=BlockOut, status_code=201)
async def create_block(
    body: BlockCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.blocked_id == current_user.id:
        raise bad_request("SELF_BLOCK", "자기 자신은 차단할 수 없습니다")

    existing = await db.execute(
        select(UserBlock).where(
            (UserBlock.blocker_id == current_user.id) & (UserBlock.blocked_id == body.blocked_id)
        )
    )
    found = existing.scalar_one_or_none()
    if found:
        return found

    block = UserBlock(blocker_id=current_user.id, blocked_id=body.blocked_id, reason=body.reason)
    db.add(block)
    await db.flush()
    await db.refresh(block)
    return block


@router.get("/blocks/me", response_model=list[BlockOut])
async def list_my_blocks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(UserBlock)
        .where(UserBlock.blocker_id == current_user.id)
        .order_by(UserBlock.created_at.desc())
    )
    return list(result.scalars().all())


# ── Hide / Unhide ────────────────────────────────────────────
class HideRequest(BaseModel):
    target_type: str
    target_id: uuid.UUID
    hidden: bool


@router.post("/hide")
async def toggle_hide(
    body: HideRequest,
    db: AsyncSession = Depends(get_db),
    _mod: User = Depends(require_moderator),
):
    if body.target_type == "post":
        result = await db.execute(select(Post).where(Post.id == body.target_id))
        obj = result.scalar_one_or_none()
    elif body.target_type == "comment":
        result = await db.execute(select(Comment).where(Comment.id == body.target_id))
        obj = result.scalar_one_or_none()
    else:
        raise bad_request("INVALID_TARGET", "유효하지 않은 대상입니다")
    if not obj:
        raise not_found()
    obj.is_hidden = body.hidden
    return {"ok": True}


# ── Ban / Unban User ─────────────────────────────────────────
class BanRequest(BaseModel):
    user_id: uuid.UUID
    is_banned: bool
    banned_reason: str | None = None
    banned_until: datetime | None = None


@router.post("/ban")
async def toggle_ban(
    body: BanRequest,
    db: AsyncSession = Depends(get_db),
    _mod: User = Depends(require_moderator),
):
    result = await db.execute(select(User).where(User.id == body.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise not_found()
    user.is_banned = body.is_banned
    user.banned_reason = body.banned_reason
    user.banned_until = body.banned_until
    return {"ok": True}


# ── Banned Keywords ──────────────────────────────────────────
class KeywordCreate(BaseModel):
    word: str


class KeywordOut(BaseModel):
    id: uuid.UUID
    word: str
    created_at: datetime
    model_config = {"from_attributes": True}


@router.get("/keywords", response_model=list[KeywordOut])
async def list_keywords(
    db: AsyncSession = Depends(get_db),
    _mod: User = Depends(require_moderator),
):
    result = await db.execute(select(BannedKeyword).order_by(BannedKeyword.created_at.desc()))
    return list(result.scalars().all())


@router.post("/keywords", response_model=KeywordOut, status_code=201)
async def add_keyword(
    body: KeywordCreate,
    db: AsyncSession = Depends(get_db),
    _mod: User = Depends(require_moderator),
):
    exists = await db.execute(select(BannedKeyword).where(BannedKeyword.word == body.word))
    if exists.scalar_one_or_none():
        raise bad_request("DUPLICATE", "이미 등록된 키워드입니다")
    kw = BannedKeyword(word=body.word)
    db.add(kw)
    await db.flush()
    await db.refresh(kw)
    return kw


@router.delete("/keywords/{keyword_id}", status_code=204)
async def delete_keyword(
    keyword_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _mod: User = Depends(require_moderator),
):
    result = await db.execute(select(BannedKeyword).where(BannedKeyword.id == keyword_id))
    kw = result.scalar_one_or_none()
    if not kw:
        raise not_found()
    await db.delete(kw)
