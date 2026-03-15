from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import and_, delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.post import Bookmark, Comment, Post, PostLike
from src.core.api.v1.domain.models.user import User
from src.core.errors import forbidden, not_found
from src.core.policy import check_banned_keywords

router = APIRouter(prefix="/posts", tags=["posts"])


class PostType(str, Enum):
    review = "review"
    tip = "tip"
    market = "market"
    meetup = "meetup"
    job = "job"


class PostCreate(BaseModel):
    type: PostType
    title: str
    body: str
    area: str | None = None
    tags: str | None = None
    images: list[str] | None = None


class PostUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    area: str | None = None
    tags: str | None = None


class PostOut(BaseModel):
    id: uuid.UUID
    author_id: uuid.UUID
    type: str
    title: str
    body: str
    area: str | None
    tags: str | None
    images: list | None
    like_count: int
    comment_count: int
    is_hidden: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    body: str


class CommentOut(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    author_id: uuid.UUID
    body: str
    is_hidden: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class CursorPage(BaseModel):
    items: list[PostOut]
    next_cursor: str | None = None


# ── Bookmark (user-scoped, must be before /{post_id}) ────────
@router.get("/me/bookmarks", response_model=list[PostOut])
async def my_bookmarks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Post)
        .join(Bookmark, Bookmark.post_id == Post.id)
        .where(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
    )
    return list(result.scalars().all())


# ── Posts CRUD ───────────────────────────────────────────────
@router.get("", response_model=CursorPage)
async def list_posts(
    type: PostType | None = None,
    area: str | None = None,
    tag: str | None = None,
    q: str | None = None,
    cursor: str | None = None,
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Post).where(Post.is_hidden == False).order_by(Post.created_at.desc())
    if type:
        stmt = stmt.where(Post.type == type.value)
    if area:
        stmt = stmt.where(Post.area == area)
    if tag:
        stmt = stmt.where(Post.tags.ilike(f"%{tag}%"))
    if q:
        stmt = stmt.where(Post.title.ilike(f"%{q}%") | Post.body.ilike(f"%{q}%"))
    if cursor:
        try:
            cursor_dt = datetime.fromisoformat(cursor)
            stmt = stmt.where(Post.created_at < cursor_dt)
        except ValueError:
            pass
    stmt = stmt.limit(limit + 1)
    result = await db.execute(stmt)
    rows = list(result.scalars().all())
    next_cursor = None
    if len(rows) > limit:
        rows = rows[:limit]
        next_cursor = rows[-1].created_at.isoformat()
    return CursorPage(items=rows, next_cursor=next_cursor)


@router.post("", response_model=PostOut, status_code=201)
async def create_post(
    body: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await check_banned_keywords(db, body.title + " " + body.body)
    post = Post(
        author_id=current_user.id,
        type=body.type.value,
        title=body.title,
        body=body.body,
        area=body.area,
        tags=body.tags,
        images=body.images,
    )
    db.add(post)
    await db.flush()
    await db.refresh(post)
    return post


@router.get("/{post_id}", response_model=PostOut)
async def get_post(post_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise not_found()
    return post


@router.patch("/{post_id}", response_model=PostOut)
async def update_post(
    post_id: uuid.UUID,
    body: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise not_found()
    if post.author_id != current_user.id and current_user.role not in ("moderator", "admin"):
        raise forbidden()
    text_parts = []
    if body.title is not None:
        text_parts.append(body.title)
    if body.body is not None:
        text_parts.append(body.body)
    if text_parts:
        await check_banned_keywords(db, " ".join(text_parts))
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(post, field, value)
    await db.flush()
    await db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=204)
async def delete_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise not_found()
    if post.author_id != current_user.id and current_user.role not in ("moderator", "admin"):
        raise forbidden()
    await db.delete(post)


# ── Comments ─────────────────────────────────────────────────
@router.get("/{post_id}/comments", response_model=list[CommentOut])
async def list_comments(post_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at.asc())
    )
    return list(result.scalars().all())


@router.post("/{post_id}/comments", response_model=CommentOut, status_code=201)
async def create_comment(
    post_id: uuid.UUID,
    body: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise not_found()
    await check_banned_keywords(db, body.body)
    comment = Comment(post_id=post_id, author_id=current_user.id, body=body.body)
    db.add(comment)
    post.comment_count = post.comment_count + 1
    await db.flush()
    await db.refresh(comment)
    return comment


# ── Like ─────────────────────────────────────────────────────
@router.post("/{post_id}/like", status_code=201)
async def like_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exists = await db.execute(
        select(PostLike).where(and_(PostLike.post_id == post_id, PostLike.user_id == current_user.id))
    )
    if exists.scalar_one_or_none():
        raise not_found("이미 좋아요를 눌렀습니다")
    db.add(PostLike(post_id=post_id, user_id=current_user.id))
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post:
        post.like_count = post.like_count + 1
    return {"ok": True}


@router.delete("/{post_id}/like", status_code=204)
async def unlike_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PostLike).where(and_(PostLike.post_id == post_id, PostLike.user_id == current_user.id))
    )
    like = result.scalar_one_or_none()
    if not like:
        raise not_found()
    await db.delete(like)
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post and post.like_count > 0:
        post.like_count = post.like_count - 1


# ── Bookmark ─────────────────────────────────────────────────
@router.post("/{post_id}/bookmark", status_code=201)
async def bookmark_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exists = await db.execute(
        select(Bookmark).where(and_(Bookmark.post_id == post_id, Bookmark.user_id == current_user.id))
    )
    if exists.scalar_one_or_none():
        raise not_found("이미 북마크에 추가되어 있습니다")
    db.add(Bookmark(post_id=post_id, user_id=current_user.id))
    return {"ok": True}


@router.delete("/{post_id}/bookmark", status_code=204)
async def remove_bookmark(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Bookmark).where(and_(Bookmark.post_id == post_id, Bookmark.user_id == current_user.id))
    )
    bm = result.scalar_one_or_none()
    if not bm:
        raise not_found()
    await db.delete(bm)
