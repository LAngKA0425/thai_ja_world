"""
Public 읽기 전용 API.
경로: /api/v1/public/*
인증: 불필요

규칙:
- published 상태의 콘텐츠만 반환
- 쓰기/수정/삭제 엔드포인트 없음
- admin 내부 데이터(작성자, 승인자 등) 노출 안 함
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.cms import NewsArticle, NewsCategory
from src.core.errors import not_found

router = APIRouter(prefix="/public", tags=["public"])


# ── 뉴스 목록 (published만) ───────────────────────────────────
class PublicNewsItem(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    summary: str | None
    category_id: uuid.UUID | None
    locale: str
    thumbnail_url: str | None
    published_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PublicNewsList(BaseModel):
    items: list[PublicNewsItem]
    total: int


@router.get("/news", response_model=PublicNewsList)
async def public_news_list(
    category_id: uuid.UUID | None = None,
    locale: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    db: AsyncSession = Depends(get_db),
):
    base = select(NewsArticle).where(NewsArticle.status == "published")
    count_base = select(func.count()).select_from(NewsArticle).where(NewsArticle.status == "published")

    if category_id:
        base = base.where(NewsArticle.category_id == category_id)
        count_base = count_base.where(NewsArticle.category_id == category_id)
    if locale:
        base = base.where(NewsArticle.locale == locale)
        count_base = count_base.where(NewsArticle.locale == locale)

    total = (await db.execute(count_base)).scalar_one()
    result = await db.execute(
        base.order_by(NewsArticle.published_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    return PublicNewsList(items=list(result.scalars().all()), total=total)


# ── 뉴스 상세 (published만, slug 기반) ────────────────────────
class PublicNewsDetail(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    body: str
    summary: str | None
    category_id: uuid.UUID | None
    locale: str
    thumbnail_url: str | None
    published_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("/news/{slug}", response_model=PublicNewsDetail)
async def public_news_detail(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(NewsArticle).where(
            NewsArticle.slug == slug,
            NewsArticle.status == "published",
        )
    )
    article = result.scalar_one_or_none()
    if not article:
        raise not_found()
    return article


# ── 카테고리 목록 (active만) ───────────────────────────────────
class PublicCategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str

    model_config = {"from_attributes": True}


@router.get("/news-categories", response_model=list[PublicCategoryOut])
async def public_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(NewsCategory)
        .where(NewsCategory.is_active == True)
        .order_by(NewsCategory.sort_order)
    )
    return list(result.scalars().all())


# ── 헬스체크 ──────────────────────────────────────────────────
@router.get("/health")
async def public_health():
    return {"status": "ok"}
