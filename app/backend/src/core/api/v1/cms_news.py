"""
Admin CMS 뉴스 워크플로우 엔드포인트.
경로: /api/v1/admin/news/*
인증: admin_users 전용 JWT 필수

워크플로우 전환 규칙:
  draft → pending → approved → published
  pending → draft (반려)
  approved → pending (재검토)
  published → draft (비공개 전환)

뉴스봇은 draft 로만 저장 가능.
published 전환은 반드시 admin이 수행.
"""
from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.cms import (
    AdminUser, BotLog, NewsArticle, NewsCategory, NewsSource,
)
from src.core.api.v1.domain.models.admin import AdminAuditLog
from src.core.api.v1.cms_deps import get_current_admin
from src.core.errors import bad_request, not_found

router = APIRouter(prefix="/admin/news", tags=["admin-news"])

# ── 유틸 ───────────────────────────────────────────────────────
VALID_TRANSITIONS: dict[str, list[str]] = {
    "draft": ["pending"],
    "pending": ["approved", "draft"],
    "approved": ["published", "pending"],
    "published": ["draft"],
}


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text[:200] + "-" + uuid.uuid4().hex[:8]


# ── 스키마 ─────────────────────────────────────────────────────
class NewsArticleCreate(BaseModel):
    title: str
    body: str
    summary: str | None = None
    category_id: uuid.UUID | None = None
    locale: str = "ko"
    thumbnail_url: str | None = None
    original_link: str | None = None
    meta: dict | None = None


class NewsArticleUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    summary: str | None = None
    category_id: uuid.UUID | None = None
    locale: str | None = None
    thumbnail_url: str | None = None
    meta: dict | None = None


class StatusChange(BaseModel):
    status: str  # draft / pending / approved / published


class NewsArticleOut(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    body: str
    summary: str | None
    category_id: uuid.UUID | None
    locale: str
    status: str
    thumbnail_url: str | None
    original_link: str | None
    author_admin_id: uuid.UUID | None
    approved_by: uuid.UUID | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NewsArticleList(BaseModel):
    items: list[NewsArticleOut]
    total: int


# ── 기사 CRUD ──────────────────────────────────────────────────
@router.get("/articles", response_model=NewsArticleList)
async def list_articles(
    status: str | None = None,
    category_id: uuid.UUID | None = None,
    locale: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    stmt = select(NewsArticle).order_by(NewsArticle.created_at.desc())
    count_stmt = select(func.count()).select_from(NewsArticle)
    if status:
        stmt = stmt.where(NewsArticle.status == status)
        count_stmt = count_stmt.where(NewsArticle.status == status)
    if category_id:
        stmt = stmt.where(NewsArticle.category_id == category_id)
        count_stmt = count_stmt.where(NewsArticle.category_id == category_id)
    if locale:
        stmt = stmt.where(NewsArticle.locale == locale)
        count_stmt = count_stmt.where(NewsArticle.locale == locale)
    total = (await db.execute(count_stmt)).scalar_one()
    result = await db.execute(stmt.offset((page - 1) * limit).limit(limit))
    return NewsArticleList(items=list(result.scalars().all()), total=total)


@router.get("/articles/{article_id}", response_model=NewsArticleOut)
async def get_article(
    article_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(NewsArticle).where(NewsArticle.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise not_found()
    return article


@router.post("/articles", response_model=NewsArticleOut, status_code=201)
async def create_article(
    body: NewsArticleCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    article = NewsArticle(
        title=body.title,
        slug=_slugify(body.title),
        body=body.body,
        summary=body.summary,
        category_id=body.category_id,
        locale=body.locale,
        thumbnail_url=body.thumbnail_url,
        original_link=body.original_link,
        meta=body.meta,
        status="draft",
        author_admin_id=admin.id,
    )
    db.add(article)
    await db.flush()
    await db.refresh(article)

    db.add(AdminAuditLog(
        admin_user_id=admin.id,
        action="create_article",
        target_type="news_article",
        target_id=str(article.id),
    ))
    return article


@router.patch("/articles/{article_id}", response_model=NewsArticleOut)
async def update_article(
    article_id: uuid.UUID,
    body: NewsArticleUpdate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(NewsArticle).where(NewsArticle.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise not_found()

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(article, field, value)
    await db.flush()
    await db.refresh(article)

    db.add(AdminAuditLog(
        admin_user_id=admin.id,
        action="update_article",
        target_type="news_article",
        target_id=str(article_id),
        payload=body.model_dump(exclude_unset=True),
    ))
    return article


@router.post("/articles/{article_id}/status", response_model=NewsArticleOut)
async def change_article_status(
    article_id: uuid.UUID,
    body: StatusChange,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(NewsArticle).where(NewsArticle.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise not_found()

    allowed = VALID_TRANSITIONS.get(article.status, [])
    if body.status not in allowed:
        raise bad_request(
            "INVALID_TRANSITION",
            f"'{article.status}' → '{body.status}' 전환 불가. 허용: {allowed}",
        )

    old_status = article.status
    article.status = body.status

    if body.status == "approved":
        article.approved_by = admin.id
    if body.status == "published":
        article.published_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(article)

    db.add(AdminAuditLog(
        admin_user_id=admin.id,
        action="change_article_status",
        target_type="news_article",
        target_id=str(article_id),
        payload={"from": old_status, "to": body.status},
    ))
    return article


# ── 카테고리 CRUD ──────────────────────────────────────────────
class CategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str
    slug: str
    sort_order: int = 0


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(NewsCategory).order_by(NewsCategory.sort_order))
    return list(result.scalars().all())


@router.post("/categories", response_model=CategoryOut, status_code=201)
async def create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    cat = NewsCategory(name=body.name, slug=body.slug, sort_order=body.sort_order)
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return cat


# ── 뉴스 소스 CRUD ────────────────────────────────────────────
class SourceOut(BaseModel):
    id: uuid.UUID
    name: str
    rss_url: str
    source_type: str
    is_active: bool
    priority: int
    last_fetched_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SourceCreate(BaseModel):
    name: str
    rss_url: str
    source_type: str = "rss"
    is_active: bool = True
    priority: int = 0


@router.get("/sources", response_model=list[SourceOut])
async def list_sources(
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(NewsSource).order_by(NewsSource.priority))
    return list(result.scalars().all())


@router.post("/sources", response_model=SourceOut, status_code=201)
async def create_source(
    body: SourceCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    source = NewsSource(
        name=body.name,
        rss_url=body.rss_url,
        source_type=body.source_type,
        is_active=body.is_active,
        priority=body.priority,
    )
    db.add(source)
    await db.flush()
    await db.refresh(source)

    db.add(AdminAuditLog(
        admin_user_id=admin.id,
        action="create_news_source",
        target_type="news_source",
        target_id=str(source.id),
    ))
    return source


# ── 봇 로그 조회 ──────────────────────────────────────────────
class BotLogOut(BaseModel):
    id: uuid.UUID
    action: str
    source_name: str | None
    articles_collected: int
    articles_skipped: int
    error: str | None
    meta: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("/bot-logs", response_model=list[BotLogOut])
async def list_bot_logs(
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(
        select(BotLog).order_by(BotLog.created_at.desc()).limit(limit)
    )
    return list(result.scalars().all())
