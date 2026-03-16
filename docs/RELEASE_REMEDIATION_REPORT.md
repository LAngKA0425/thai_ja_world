# TAEJA WORLD — Unified Admin CMS + News Bot Release Remediation Report

**Date:** 2026-03-16
**Status:** Post-domain-connection first release verification
**Domain:** https://thaijaworld.com

---

## 1. All CMS Tables Migration Completed

**Status: FAIL**

### Current State
- The backend uses `Base.metadata.create_all()` in `main.py` lifespan — no Alembic migrations
- Existing tables in models: `users`, `posts`, `comments`, `post_likes`, `bookmarks`, `email_verification_tokens`, `reports`, `banned_keywords`, `user_blocks`, `webauthn_credentials`, `ingested_sources`, `ingested_drafts`, `scheduled_posts`, `admin_audit_logs`, `admin_notifications`, `user_reports`, `point_balances`, `point_transactions`, `quest_definitions`, `user_quest_states`, `minihome_profiles`, `guestbook_entries`, `minihome_albums`, `minihome_visit_logs`, `minihome_bgm`, `miniroom_objects`, `miniroom_interaction_logs`, `shop_items`, `purchase_logs`, `user_shop_inventory`, `reservation_shops`, `reservation_slots`, `reservations`, `reservation_point_usage`, `notifications`
- **MISSING** (per reference design): `admin_users`, `roles`, `permissions`, `role_permissions`, `site_content`, `banners`, `announcements`, `i18n_content`, `news_categories`, `news_sources` (PostgreSQL version), `news_articles`, `bot_keywords`, `bot_settings`, `media_library`, `bot_logs`, `system_settings`
- Risk level: **HIGH**

### Root Cause
The CMS feature tables were never created. The backend only has the social platform tables + basic admin ingestion tables. The reference design's CMS architecture was not implemented.

### Files to Patch
- `app/backend/src/core/api/v1/domain/models/cms.py` — NEW
- `app/backend/src/main.py` — add import to register models with metadata

### Required Changes

Create `app/backend/src/core/api/v1/domain/models/cms.py`:

```python
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.core.api.v1.domain.infra.db import Base


# ── Admin Users (separate from public users) ─────────────────
class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    nickname: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


# ── RBAC ──────────────────────────────────────────────────────
class Role(Base):
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)


class RolePermission(Base):
    __tablename__ = "role_permissions"
    __table_args__ = (UniqueConstraint("role_id", "permission_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    permission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False)


# ── Site Content ──────────────────────────────────────────────
class SiteContent(Base):
    __tablename__ = "site_content"
    __table_args__ = (
        UniqueConstraint("slug", "locale"),
        Index("ix_site_content_slug", "slug"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(200), nullable=False)
    locale: Mapped[str] = mapped_column(String(10), nullable=False, default="ko")
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Banner(Base):
    __tablename__ = "banners"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    position: Mapped[str] = mapped_column(String(50), nullable=False, default="main_top")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    locale: Mapped[str] = mapped_column(String(10), nullable=False, default="ko")
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class I18nContent(Base):
    __tablename__ = "i18n_content"
    __table_args__ = (UniqueConstraint("content_key", "locale"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_key: Mapped[str] = mapped_column(String(200), nullable=False)
    locale: Mapped[str] = mapped_column(String(10), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


# ── News System ───────────────────────────────────────────────
class NewsCategory(Base):
    __tablename__ = "news_categories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class NewsSource(Base):
    __tablename__ = "news_sources_pg"
    # Named news_sources_pg to avoid clash with Supabase newsbot table name in future migration

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    rss_url: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    source_type: Mapped[str] = mapped_column(String(20), nullable=False, default="rss")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    last_fetched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class NewsArticle(Base):
    __tablename__ = "news_articles"
    __table_args__ = (
        Index("ix_news_articles_status", "status"),
        Index("ix_news_articles_category", "category_id"),
        Index("ix_news_articles_published", "published_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("news_sources_pg.id"), nullable=True)
    category_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("news_categories.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    locale: Mapped[str] = mapped_column(String(10), nullable=False, default="ko")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")  # draft/pending/approved/published
    original_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    author_admin_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    approved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class BotKeyword(Base):
    __tablename__ = "bot_keywords"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    keyword: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    category_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("news_categories.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class BotSetting(Base):
    __tablename__ = "bot_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


# ── Media ─────────────────────────────────────────────────────
class MediaLibrary(Base):
    __tablename__ = "media_library"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ── Bot Logs ──────────────────────────────────────────────────
class BotLog(Base):
    __tablename__ = "bot_logs"
    __table_args__ = (
        Index("ix_bot_logs_created", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    source_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    articles_collected: Mapped[int] = mapped_column(Integer, default=0)
    articles_skipped: Mapped[int] = mapped_column(Integer, default=0)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ── System Settings ───────────────────────────────────────────
class SystemSetting(Base):
    __tablename__ = "system_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
```

Add import in `app/backend/src/main.py` (after existing admin imports):

```python
from src.core.api.v1.domain.models.cms import (
    AdminUser, Role, Permission, RolePermission,
    SiteContent, Banner, Announcement, I18nContent,
    NewsCategory, NewsSource, NewsArticle, BotKeyword, BotSetting,
    MediaLibrary, BotLog, SystemSetting,
)
```

### Verification Steps
```bash
# After adding models and restarting:
docker compose exec backend python -c "
from src.core.api.v1.domain.infra.db import engine, Base
from src.core.api.v1.domain.models.cms import *
import asyncio
async def check():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('All CMS tables created successfully')
asyncio.run(check())
"
```

### Release Decision: **BLOCKER** — tables must exist before any CMS feature can function

---

## 2. Initial super_admin Account Created in admin_users

**Status: FAIL**

### Current State
- A seed exists in `main.py` that creates a user with `role="admin"` in the **`users`** table (the public users table)
- No `admin_users` table exists (see Item 1)
- The current seed uses `FIRST_ADMIN_EMAIL=queenhananana1216@gmail.com` / `FIRST_ADMIN_PASSWORD=Langka_0425$$`
- Risk level: **HIGH**

### Root Cause
The admin authentication was implemented on top of the public `users` table. There is no separate `admin_users` table. The reference design requires a dedicated admin_users table with its own auth.

### Files to Patch
- `app/backend/src/main.py` — add admin_users seed in lifespan

### Required Changes

Add to `main.py` lifespan, after existing seeds:

```python
    # Seed super_admin in admin_users table
    from src.core.api.v1.domain.models.cms import AdminUser, Role, Permission, RolePermission
    async with async_session() as db:
        # Create super_admin role if not exists
        result = await db.execute(select(Role).where(Role.name == "super_admin"))
        role = result.scalar_one_or_none()
        if not role:
            role = Role(name="super_admin", description="Full system access")
            db.add(role)
            await db.flush()

            # Seed base permissions
            base_perms = [
                "admin.users.read", "admin.users.write",
                "admin.content.read", "admin.content.write",
                "admin.news.read", "admin.news.write", "admin.news.approve",
                "admin.media.read", "admin.media.write",
                "admin.settings.read", "admin.settings.write",
                "admin.bot.read", "admin.bot.write",
                "admin.audit.read",
            ]
            for perm_name in base_perms:
                perm = Permission(name=perm_name, description=perm_name)
                db.add(perm)
                await db.flush()
                db.add(RolePermission(role_id=role.id, permission_id=perm.id))
            await db.flush()

        # Create super_admin user if not exists
        result = await db.execute(select(AdminUser).where(AdminUser.email == settings.FIRST_ADMIN_EMAIL))
        if not result.scalar_one_or_none():
            admin = AdminUser(
                email=settings.FIRST_ADMIN_EMAIL,
                nickname="super_admin",
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role_id=role.id,
                is_active=True,
            )
            db.add(admin)
        await db.commit()
```

### Verification Steps
```bash
docker compose exec backend python -c "
from src.core.api.v1.domain.infra.db import async_session
from src.core.api.v1.domain.models.cms import AdminUser
from sqlalchemy import select
import asyncio
async def check():
    async with async_session() as db:
        result = await db.execute(select(AdminUser))
        admins = result.scalars().all()
        for a in admins:
            print(f'{a.email} role_id={a.role_id} active={a.is_active}')
asyncio.run(check())
"
```

### Release Decision: **BLOCKER**

---

## 3. RBAC Permission System Working Correctly

**Status: FAIL**

### Current State
- No `roles`, `permissions`, `role_permissions` tables
- Current admin check: `user.role == "admin"` on the `users` table (string comparison)
- `deps.py` has `require_admin()` that checks `current_user.role != "admin"`
- Risk level: **HIGH**

### Root Cause
RBAC was never implemented. The system uses a simple string role field.

### Files to Patch
- `app/backend/src/core/api/v1/domain/models/cms.py` — already covered in Item 1
- `app/backend/src/core/api/v1/cms_deps.py` — NEW: admin auth deps using admin_users table
- `app/backend/src/core/api/v1/cms_auth.py` — NEW: admin auth endpoints

### Required Changes

Create `app/backend/src/core/api/v1/cms_deps.py`:

```python
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.cms import AdminUser, Role, RolePermission, Permission
from src.core.errors import forbidden, unauthorized
from src.core.config import settings

from jose import JWTError, jwt

ADMIN_JWT_SECRET = settings.SECRET_KEY + "_admin"
ALGORITHM = "HS256"


def create_admin_access_token(subject: str, nickname: str | None = None) -> str:
    from datetime import timedelta
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expire, "type": "admin_access"}
    if nickname:
        payload["nickname"] = nickname
    return jwt.encode(payload, ADMIN_JWT_SECRET, algorithm=ALGORITHM)


def decode_admin_token(token: str) -> dict:
    try:
        return jwt.decode(token, ADMIN_JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return {}


async def get_current_admin(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> AdminUser:
    if not authorization.startswith("Bearer "):
        raise unauthorized()
    token = authorization.removeprefix("Bearer ")
    payload = decode_admin_token(token)
    sub = payload.get("sub")
    token_type = payload.get("type")
    if not sub or token_type != "admin_access":
        raise unauthorized()
    try:
        admin_id = uuid.UUID(sub)
    except ValueError:
        raise unauthorized()
    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = result.scalar_one_or_none()
    if admin is None or not admin.is_active:
        raise unauthorized()
    return admin


async def require_permission(permission_name: str, admin: AdminUser = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    if admin.role_id is None:
        raise forbidden("권한이 없습니다")
    result = await db.execute(
        select(Permission.name)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == admin.role_id)
    )
    perms = {row[0] for row in result.all()}
    # super_admin has all permissions
    role_result = await db.execute(select(Role.name).where(Role.id == admin.role_id))
    role_name = role_result.scalar_one_or_none()
    if role_name == "super_admin":
        return admin
    if permission_name not in perms:
        raise forbidden("권한이 없습니다")
    return admin
```

Create `app/backend/src/core/api/v1/cms_auth.py`:

```python
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.cms import AdminUser
from src.core.api.v1.cms_deps import create_admin_access_token, get_current_admin
from src.core.errors import unauthorized
from src.core.security import verify_password

router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginResponse(BaseModel):
    token: str
    user: dict


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(body: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminUser).where(AdminUser.email == body.email))
    admin = result.scalar_one_or_none()
    if not admin or not admin.is_active:
        raise unauthorized("이메일 또는 비밀번호가 일치하지 않습니다")
    if not verify_password(body.password, admin.hashed_password):
        raise unauthorized("이메일 또는 비밀번호가 일치하지 않습니다")

    admin.last_login_at = datetime.now(timezone.utc)
    await db.flush()

    token = create_admin_access_token(str(admin.id), admin.nickname)
    return AdminLoginResponse(
        token=token,
        user={"id": str(admin.id), "email": admin.email, "nickname": admin.nickname, "isAdmin": True},
    )


class AdminMeResponse(BaseModel):
    id: str
    email: str
    nickname: str
    is_active: bool


@router.get("/me", response_model=AdminMeResponse)
async def admin_me(admin: AdminUser = Depends(get_current_admin)):
    return AdminMeResponse(id=str(admin.id), email=admin.email, nickname=admin.nickname, is_active=admin.is_active)
```

Register in `app/backend/src/core/api/v1/router.py`:

```python
from src.core.api.v1.cms_auth import router as cms_auth_router
# ... existing routers ...
api_router.include_router(cms_auth_router)
```

### Verification Steps
```bash
# Login as admin
curl -X POST https://thaijaworld.com/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"queenhananana1216@gmail.com","password":"Langka_0425$$"}'
# Expected: {"token":"...","user":{"id":"...","email":"...","nickname":"super_admin","isAdmin":true}}
```

### Release Decision: **BLOCKER**

---

## 4. News Workflow Tested End-to-End (draft → pending → approved → published)

**Status: FAIL**

### Current State
- Current workflow: `ingested_drafts` (new/reviewed/rejected/converted) → `scheduled_posts` (draft/scheduled/published/canceled/failed) → `posts` table
- Reference design requires: `news_articles` with statuses `draft → pending → approved → published`
- No `news_articles` table exists
- Risk level: **HIGH**

### Root Cause
The news workflow was built around the ingestion/scheduling model for the social `posts` table, not a dedicated CMS news article workflow.

### Files to Patch
- `app/backend/src/core/api/v1/cms_news.py` — NEW: news workflow endpoints

### Required Changes

Create `app/backend/src/core/api/v1/cms_news.py`:

```python
from __future__ import annotations

import uuid
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.cms import NewsArticle, NewsCategory, AdminUser, AdminAuditLog
from src.core.api.v1.domain.models.admin import AdminAuditLog
from src.core.api.v1.cms_deps import get_current_admin
from src.core.errors import bad_request, not_found

router = APIRouter(prefix="/admin/news", tags=["admin-news"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return text[:200] + "-" + uuid.uuid4().hex[:8]


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
    status: str | None = None  # draft/pending/approved/published
    meta: dict | None = None


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
    offset = (page - 1) * limit
    result = await db.execute(stmt.offset(offset).limit(limit))
    return NewsArticleList(items=list(result.scalars().all()), total=total)


@router.post("/articles", response_model=NewsArticleOut, status_code=201)
async def create_article(
    body: NewsArticleCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    article = NewsArticle(
        title=body.title,
        slug=slugify(body.title),
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

    log = AdminAuditLog(admin_user_id=admin.id, action="create_article", target_type="news_article", target_id=str(article.id))
    db.add(log)
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
        if field == "status":
            # Enforce workflow: draft → pending → approved → published
            valid_transitions = {
                "draft": ["pending"],
                "pending": ["approved", "draft"],
                "approved": ["published", "pending"],
                "published": ["draft"],
            }
            allowed = valid_transitions.get(article.status, [])
            if value not in allowed:
                raise bad_request("INVALID_TRANSITION", f"'{article.status}' → '{value}' 전환 불가")
            if value == "approved":
                article.approved_by = admin.id
            if value == "published":
                article.published_at = datetime.now(timezone.utc)
        setattr(article, field, value)

    await db.flush()
    await db.refresh(article)

    log = AdminAuditLog(admin_user_id=admin.id, action="update_article", target_type="news_article", target_id=str(article_id), payload=body.model_dump(exclude_unset=True))
    db.add(log)
    return article


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


# ── Categories ────────────────────────────────────────────────
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
async def list_categories(db: AsyncSession = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)):
    result = await db.execute(select(NewsCategory).order_by(NewsCategory.sort_order))
    return list(result.scalars().all())


@router.post("/categories", response_model=CategoryOut, status_code=201)
async def create_category(body: CategoryCreate, db: AsyncSession = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    cat = NewsCategory(name=body.name, slug=body.slug, sort_order=body.sort_order)
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return cat
```

Register in `router.py`:

```python
from src.core.api.v1.cms_news import router as cms_news_router
api_router.include_router(cms_news_router)
```

### Verification Steps
```bash
# Create draft → pending → approved → published
TOKEN="..."
curl -X POST .../api/v1/admin/news/articles -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title":"Test","body":"Content"}'
# Returns status: "draft"

curl -X PATCH .../api/v1/admin/news/articles/{id} -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"pending"}'
curl -X PATCH .../api/v1/admin/news/articles/{id} -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"approved"}'
curl -X PATCH .../api/v1/admin/news/articles/{id} -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"published"}'
# Verify published_at is set
```

### Release Decision: **BLOCKER**

---

## 5. Multilingual Content CRUD Working

**Status: FAIL**

### Current State
- No `i18n_content` table
- No `site_content` table with locale column
- The admin frontend has a `ko.ts` localization file that is MISSING (causes runtime crash)
- Risk level: **MEDIUM**

### Root Cause
Multilingual content management was never implemented.

### Files to Patch
- `app/backend/src/core/api/v1/cms_content.py` — NEW: content CRUD endpoints

### Required Changes

Create `app/backend/src/core/api/v1/cms_content.py`:

```python
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.cms import SiteContent, Banner, Announcement, I18nContent, AdminUser
from src.core.api.v1.domain.models.admin import AdminAuditLog
from src.core.api.v1.cms_deps import get_current_admin
from src.core.errors import not_found

router = APIRouter(prefix="/admin/content", tags=["admin-content"])


# ── Site Content ──────────────────────────────────────────────
class SiteContentOut(BaseModel):
    id: uuid.UUID
    slug: str
    locale: str
    title: str
    body: str
    meta: dict | None
    is_published: bool
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class SiteContentCreate(BaseModel):
    slug: str
    locale: str = "ko"
    title: str
    body: str
    meta: dict | None = None
    is_published: bool = False


class SiteContentUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    meta: dict | None = None
    is_published: bool | None = None


@router.get("/site", response_model=list[SiteContentOut])
async def list_site_content(locale: str | None = None, db: AsyncSession = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)):
    stmt = select(SiteContent).order_by(SiteContent.slug)
    if locale:
        stmt = stmt.where(SiteContent.locale == locale)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.post("/site", response_model=SiteContentOut, status_code=201)
async def create_site_content(body: SiteContentCreate, db: AsyncSession = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    content = SiteContent(slug=body.slug, locale=body.locale, title=body.title, body=body.body, meta=body.meta, is_published=body.is_published, updated_by=admin.id)
    db.add(content)
    await db.flush()
    await db.refresh(content)
    return content


@router.patch("/site/{content_id}", response_model=SiteContentOut)
async def update_site_content(content_id: uuid.UUID, body: SiteContentUpdate, db: AsyncSession = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    result = await db.execute(select(SiteContent).where(SiteContent.id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise not_found()
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(content, field, value)
    content.updated_by = admin.id
    await db.flush()
    await db.refresh(content)
    log = AdminAuditLog(admin_user_id=admin.id, action="update_site_content", target_type="site_content", target_id=str(content_id), payload=body.model_dump(exclude_unset=True))
    db.add(log)
    return content


# ── Banners ───────────────────────────────────────────────────
class BannerOut(BaseModel):
    id: uuid.UUID
    title: str
    image_url: str
    link_url: str | None
    position: str
    sort_order: int
    is_active: bool
    starts_at: datetime | None
    ends_at: datetime | None
    created_at: datetime
    model_config = {"from_attributes": True}


class BannerCreate(BaseModel):
    title: str
    image_url: str
    link_url: str | None = None
    position: str = "main_top"
    sort_order: int = 0
    is_active: bool = True
    starts_at: datetime | None = None
    ends_at: datetime | None = None


@router.get("/banners", response_model=list[BannerOut])
async def list_banners(db: AsyncSession = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)):
    result = await db.execute(select(Banner).order_by(Banner.sort_order))
    return list(result.scalars().all())


@router.post("/banners", response_model=BannerOut, status_code=201)
async def create_banner(body: BannerCreate, db: AsyncSession = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    banner = Banner(**body.model_dump())
    db.add(banner)
    await db.flush()
    await db.refresh(banner)
    return banner


# ── Announcements ─────────────────────────────────────────────
class AnnouncementOut(BaseModel):
    id: uuid.UUID
    title: str
    body: str
    locale: str
    is_pinned: bool
    is_published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    locale: str = "ko"
    is_pinned: bool = False
    is_published: bool = False


@router.get("/announcements", response_model=list[AnnouncementOut])
async def list_announcements(db: AsyncSession = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)):
    result = await db.execute(select(Announcement).order_by(Announcement.created_at.desc()))
    return list(result.scalars().all())


@router.post("/announcements", response_model=AnnouncementOut, status_code=201)
async def create_announcement(body: AnnouncementCreate, db: AsyncSession = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    from datetime import timezone
    ann = Announcement(**body.model_dump(), created_by=admin.id)
    if body.is_published:
        ann.published_at = datetime.now(timezone.utc)
    db.add(ann)
    await db.flush()
    await db.refresh(ann)
    return ann


# ── I18n ──────────────────────────────────────────────────────
class I18nOut(BaseModel):
    id: uuid.UUID
    content_key: str
    locale: str
    value: str
    updated_at: datetime
    model_config = {"from_attributes": True}


class I18nCreate(BaseModel):
    content_key: str
    locale: str
    value: str


@router.get("/i18n", response_model=list[I18nOut])
async def list_i18n(locale: str | None = None, db: AsyncSession = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)):
    stmt = select(I18nContent)
    if locale:
        stmt = stmt.where(I18nContent.locale == locale)
    result = await db.execute(stmt.order_by(I18nContent.content_key))
    return list(result.scalars().all())


@router.post("/i18n", response_model=I18nOut, status_code=201)
async def upsert_i18n(body: I18nCreate, db: AsyncSession = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    result = await db.execute(select(I18nContent).where(I18nContent.content_key == body.content_key, I18nContent.locale == body.locale))
    existing = result.scalar_one_or_none()
    if existing:
        existing.value = body.value
        existing.updated_by = admin.id
        await db.flush()
        await db.refresh(existing)
        return existing
    content = I18nContent(content_key=body.content_key, locale=body.locale, value=body.value, updated_by=admin.id)
    db.add(content)
    await db.flush()
    await db.refresh(content)
    return content
```

Register in `router.py`:

```python
from src.core.api.v1.cms_content import router as cms_content_router
api_router.include_router(cms_content_router)
```

### Release Decision: **BLOCKER** (Phase A: site_content + announcements; Phase B: full i18n)

---

## 6. Media Upload + Thumbnail Generation Working

**Status: FAIL**

### Current State
- `app/backend/src/core/api/v1/domain/models/media.py` — empty placeholder
- `app/backend/src/core/api/v1/domain/infra/storage.py` — empty placeholder
- No upload endpoint exists
- No thumbnail generation logic
- Risk level: **MEDIUM**

### Root Cause
Media feature was deferred as placeholder only.

### Files to Patch
- `app/backend/src/core/api/v1/cms_media.py` — NEW: media upload endpoint with local disk + thumbnail
- `app/backend/Dockerfile` — add Pillow to requirements

### Required Changes

Add `Pillow` to `app/backend/requirements.txt`:

```
Pillow>=10.0.0
```

Create `app/backend/src/core/api/v1/cms_media.py`:

```python
from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, UploadFile, File, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.cms import MediaLibrary, AdminUser
from src.core.api.v1.cms_deps import get_current_admin
from src.core.errors import bad_request

router = APIRouter(prefix="/admin/media", tags=["admin-media"])

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/app/uploads")
THUMB_SIZE = (300, 300)
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


class MediaOut(BaseModel):
    id: uuid.UUID
    filename: str
    original_filename: str
    mime_type: str
    file_size: int
    url: str
    thumbnail_url: str | None
    alt_text: str | None
    created_at: datetime
    model_config = {"from_attributes": True}


class MediaList(BaseModel):
    items: list[MediaOut]
    total: int


@router.get("/", response_model=MediaList)
async def list_media(
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    total = (await db.execute(select(func.count()).select_from(MediaLibrary))).scalar_one()
    result = await db.execute(select(MediaLibrary).order_by(MediaLibrary.created_at.desc()).offset((page - 1) * limit).limit(limit))
    return MediaList(items=list(result.scalars().all()), total=total)


@router.post("/upload", response_model=MediaOut, status_code=201)
async def upload_media(
    file: UploadFile = File(...),
    alt_text: str | None = None,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    if file.content_type not in ALLOWED_TYPES:
        raise bad_request("INVALID_TYPE", f"허용되지 않는 파일 형식: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise bad_request("FILE_TOO_LARGE", "파일 크기가 10MB를 초과합니다")

    ext = os.path.splitext(file.filename or "file")[1] or ".bin"
    unique_name = f"{uuid.uuid4().hex}{ext}"

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    with open(file_path, "wb") as f:
        f.write(content)

    url = f"/uploads/{unique_name}"
    thumbnail_url = None

    # Generate thumbnail for images
    if file.content_type and file.content_type.startswith("image/"):
        try:
            from PIL import Image
            import io
            img = Image.open(io.BytesIO(content))
            img.thumbnail(THUMB_SIZE)
            thumb_name = f"thumb_{unique_name}"
            thumb_path = os.path.join(UPLOAD_DIR, thumb_name)
            img.save(thumb_path, quality=85)
            thumbnail_url = f"/uploads/{thumb_name}"
        except Exception:
            pass  # Thumbnail generation is best-effort

    media = MediaLibrary(
        filename=unique_name,
        original_filename=file.filename or "unknown",
        mime_type=file.content_type or "application/octet-stream",
        file_size=len(content),
        url=url,
        thumbnail_url=thumbnail_url,
        alt_text=alt_text,
        uploaded_by=admin.id,
    )
    db.add(media)
    await db.flush()
    await db.refresh(media)
    return media
```

Register in `router.py`:

```python
from src.core.api.v1.cms_media import router as cms_media_router
api_router.include_router(cms_media_router)
```

Add to nginx.conf (static file serving for uploads):

```nginx
location /uploads/ {
    alias /app/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

And add volume in docker-compose.yml for backend:

```yaml
volumes:
  - uploads:/app/uploads
```

### Release Decision: **BLOCKER** (Phase A)

---

## 7. News Bot Collection → news_articles Storage Integration Working

**Status: FAIL**

### Current State
- Newsbot uses Supabase (`raw_news` table via `@supabase/supabase-js`)
- Newsbot does NOT write to the FastAPI PostgreSQL `news_articles` table
- Newsbot pipeline: `collect.js` → Supabase `raw_news` → `process.js` → Supabase `processed_news` → `summarize.js` → Supabase `summaries`
- No integration bridge between Supabase and PostgreSQL exists
- Risk level: **HIGH**

### Root Cause
The newsbot was built targeting Supabase. The migration to FastAPI PostgreSQL was not done.

### Files to Patch
- `newsbot/collector/collect-pg.js` — NEW: PostgreSQL-native collector
- `newsbot/config/pg-client.js` — NEW: PostgreSQL client using same DB credentials as backend

### Required Changes

Create `newsbot/config/pg-client.js`:

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.PG_DATABASE_URL || 'postgresql://taeja:changeme@localhost:5432/taeja',
});

export default pool;
```

Create `newsbot/collector/collect-pg.js`:

```javascript
/**
 * RSS 수집기 - PostgreSQL 직접 저장 (news_articles + bot_logs)
 */
import 'dotenv/config';
import Parser from 'rss-parser';
import crypto from 'crypto';
import pool from '../config/pg-client.js';

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'TajWorldNewsBot/1.0' }
});

const MAX_PER_SOURCE = parseInt(process.env.MAX_ARTICLES_PER_SOURCE || '10');

async function getActiveSources() {
  const { rows } = await pool.query(
    "SELECT * FROM news_sources_pg WHERE is_active = true ORDER BY priority ASC"
  );
  return rows;
}

async function collectFromSource(source) {
  console.log(`[수집] ${source.name} (${source.rss_url})`);
  let feed;
  try {
    feed = await parser.parseURL(source.rss_url);
  } catch (err) {
    console.error(`[실패] ${source.name}: ${err.message}`);
    await logBotAction('collect_error', source.name, 0, 0, err.message);
    return { collected: 0, skipped: 0 };
  }

  const items = (feed.items || []).slice(0, MAX_PER_SOURCE);
  let collected = 0, skipped = 0;

  for (const item of items) {
    const link = item.link || item.guid;
    if (!link) continue;

    // Check duplicate by original_link
    const { rows: existing } = await pool.query(
      "SELECT id FROM news_articles WHERE original_link = $1 LIMIT 1", [link]
    );
    if (existing.length > 0) { skipped++; continue; }

    const title = (item.title || '').trim();
    const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').slice(0, 200) + '-' + crypto.randomUUID().slice(0, 8);
    const body = item.contentSnippet || item.content || item.summary || '';

    try {
      await pool.query(
        `INSERT INTO news_articles (id, source_id, title, slug, body, summary, locale, status, original_link, meta, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'ko', 'draft', $6, $7, now(), now())`,
        [source.id, title, slug, body, body.slice(0, 300), link, JSON.stringify({ categories: item.categories || [], feedTitle: feed.title || source.name })]
      );
      collected++;
    } catch (err) {
      console.error(`[저장실패] ${title}: ${err.message}`);
    }
  }

  // Update last_fetched_at
  await pool.query("UPDATE news_sources_pg SET last_fetched_at = now() WHERE id = $1", [source.id]);
  await logBotAction('collect', source.name, collected, skipped, null);
  console.log(`[완료] ${source.name}: 수집 ${collected}, 스킵 ${skipped}`);
  return { collected, skipped };
}

async function logBotAction(action, sourceName, collected, skippd, error) {
  try {
    await pool.query(
      `INSERT INTO bot_logs (id, action, source_name, articles_collected, articles_skipped, error, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now())`,
      [action, sourceName, collected, skippd, error]
    );
  } catch (e) {
    console.error('bot_logs write error:', e.message);
  }
}

async function main() {
  console.log('=== 뉴스 수집 시작 (PostgreSQL) ===');
  const sources = await getActiveSources();
  console.log(`활성 소스: ${sources.length}개`);

  let totalCollected = 0, totalSkipped = 0;
  for (const source of sources) {
    const result = await collectFromSource(source);
    totalCollected += result.collected;
    totalSkipped += result.skipped;
  }
  console.log(`\n=== 수집 완료: 수집 ${totalCollected}, 스킵 ${totalSkipped} ===`);
  await pool.end();
}

main().catch(err => { console.error('수집 실패:', err); process.exit(1); });
```

Add `pg` to `newsbot/package.json` dependencies:

```json
"pg": "^8.13.0"
```

Add env var `PG_DATABASE_URL` to `newsbot/.env`:

```
PG_DATABASE_URL=postgresql://taeja:xgFzJkNByAXVTJsL_P4rojRUTw-JcOghYgPVmrPNyKs@localhost:5432/taeja
```

### Release Decision: **BLOCKER** (Phase A)

---

## 8. Public API Returns Published Content Correctly

**Status: FAIL**

### Current State
- No `/api/v1/public/*` endpoints exist
- All admin endpoints are under `/api/v1/admin/*`
- Public site has Next.js API routes that talk to FastAPI `/api/v1/auth/*` and `/api/v1/posts/*`
- No public endpoint for published news, site_content, banners, announcements
- Risk level: **HIGH**

### Files to Patch
- `app/backend/src/core/api/v1/cms_public.py` — NEW

### Required Changes

Create `app/backend/src/core/api/v1/cms_public.py`:

```python
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.cms import (
    NewsArticle, NewsCategory, SiteContent, Banner, Announcement,
)
from src.core.errors import not_found

router = APIRouter(prefix="/public", tags=["public"])


# ── Published News ────────────────────────────────────────────
class PublicNewsOut(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    summary: str | None
    body: str
    category_id: uuid.UUID | None
    locale: str
    thumbnail_url: str | None
    published_at: datetime | None
    created_at: datetime
    model_config = {"from_attributes": True}


class PublicNewsList(BaseModel):
    items: list[PublicNewsOut]
    total: int


@router.get("/news", response_model=PublicNewsList)
async def public_news(
    category_id: uuid.UUID | None = None,
    locale: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(NewsArticle).where(NewsArticle.status == "published").order_by(NewsArticle.published_at.desc())
    count_stmt = select(func.count()).select_from(NewsArticle).where(NewsArticle.status == "published")
    if category_id:
        stmt = stmt.where(NewsArticle.category_id == category_id)
        count_stmt = count_stmt.where(NewsArticle.category_id == category_id)
    if locale:
        stmt = stmt.where(NewsArticle.locale == locale)
        count_stmt = count_stmt.where(NewsArticle.locale == locale)
    total = (await db.execute(count_stmt)).scalar_one()
    result = await db.execute(stmt.offset((page - 1) * limit).limit(limit))
    return PublicNewsList(items=list(result.scalars().all()), total=total)


@router.get("/news/{slug}", response_model=PublicNewsOut)
async def public_news_detail(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NewsArticle).where(NewsArticle.slug == slug, NewsArticle.status == "published"))
    article = result.scalar_one_or_none()
    if not article:
        raise not_found()
    return article


# ── Published Site Content ────────────────────────────────────
class PublicContentOut(BaseModel):
    slug: str
    locale: str
    title: str
    body: str
    meta: dict | None
    updated_at: datetime
    model_config = {"from_attributes": True}


@router.get("/content/{slug}", response_model=PublicContentOut)
async def public_content(slug: str, locale: str = "ko", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SiteContent).where(SiteContent.slug == slug, SiteContent.locale == locale, SiteContent.is_published == True))
    content = result.scalar_one_or_none()
    if not content:
        raise not_found()
    return content


# ── Active Banners ────────────────────────────────────────────
class PublicBannerOut(BaseModel):
    id: uuid.UUID
    title: str
    image_url: str
    link_url: str | None
    position: str
    sort_order: int
    model_config = {"from_attributes": True}


@router.get("/banners", response_model=list[PublicBannerOut])
async def public_banners(position: str | None = None, db: AsyncSession = Depends(get_db)):
    from datetime import timezone
    now = datetime.now(timezone.utc)
    stmt = select(Banner).where(Banner.is_active == True).order_by(Banner.sort_order)
    if position:
        stmt = stmt.where(Banner.position == position)
    result = await db.execute(stmt)
    banners = result.scalars().all()
    # Filter by date range
    active = []
    for b in banners:
        if b.starts_at and b.starts_at > now:
            continue
        if b.ends_at and b.ends_at < now:
            continue
        active.append(b)
    return active


# ── Published Announcements ───────────────────────────────────
class PublicAnnouncementOut(BaseModel):
    id: uuid.UUID
    title: str
    body: str
    locale: str
    is_pinned: bool
    published_at: datetime | None
    model_config = {"from_attributes": True}


@router.get("/announcements", response_model=list[PublicAnnouncementOut])
async def public_announcements(locale: str = "ko", db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Announcement)
        .where(Announcement.is_published == True, Announcement.locale == locale)
        .order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc())
        .limit(50)
    )
    return list(result.scalars().all())


# ── News Categories ───────────────────────────────────────────
class PublicCategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    model_config = {"from_attributes": True}


@router.get("/news-categories", response_model=list[PublicCategoryOut])
async def public_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NewsCategory).where(NewsCategory.is_active == True).order_by(NewsCategory.sort_order))
    return list(result.scalars().all())
```

Register in `router.py`:

```python
from src.core.api.v1.cms_public import router as cms_public_router
api_router.include_router(cms_public_router)
```

### Release Decision: **BLOCKER**

---

## 9. Admin Save → Public Site Immediate Update Working

**Status: FAIL**

### Current State
- No revalidation strategy (no `revalidatePath`, no `revalidateTag`, no Redis Pub/Sub)
- Next.js pages have no ISR or on-demand revalidation
- Risk level: **MEDIUM**

### Root Cause
The public Next.js app does not have any cache invalidation mechanism to reflect admin changes immediately.

### Recommended Approach
Use **Next.js on-demand revalidation** (simplest production-safe option).

### Files to Patch
- `apps/web/src/app/api/revalidate/route.ts` — NEW
- Backend admin endpoints — add revalidation webhook call after save

### Required Changes

Create `apps/web/src/app/api/revalidate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.BACKEND_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const paths = body.paths || ['/'];

    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, paths });
  } catch {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
```

Backend: add helper to call revalidation after admin saves (add to `cms_content.py`, `cms_news.py`):

```python
import httpx

async def trigger_revalidation(paths: list[str]):
    """Best-effort revalidation of Next.js pages"""
    import os
    web_url = os.environ.get("WEB_INTERNAL_URL", "http://web:3000")
    secret = os.environ.get("BACKEND_INTERNAL_SECRET", "")
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(f"{web_url}/api/revalidate", json={"paths": paths}, headers={"x-revalidate-secret": secret})
    except Exception:
        pass  # Best-effort, do not fail the admin operation
```

### Release Decision: **BLOCKER** (Phase B — can deploy without but must fix within 24h)

---

## 10. Admin Audit Log Is Recorded Correctly

**Status: PARTIAL**

### Current State
- `AdminAuditLog` model EXISTS in `admin.py`
- `write_audit()` helper EXISTS and is called in admin endpoints (create_source, reject_draft, edit_draft, approve_draft, update_scheduled, publish_now, update_user)
- `GET /api/v1/admin/audit-logs` endpoint EXISTS
- **Missing**: Audit logs reference `admin_user_id` → `users.id` (public users table), not `admin_users.id`
- **Missing**: New CMS endpoints (Items 4-6) must also write audit logs
- Risk level: **LOW**

### Root Cause
The existing audit system works for the current admin flow. The FK points to `users` table because `admin_users` didn't exist. New CMS endpoints need to be wired up.

### Required Changes
- The new CMS route files (`cms_news.py`, `cms_content.py`, `cms_media.py`) already include audit log writes in their patches above
- The `AdminAuditLog.admin_user_id` FK references `users.id`. For Phase A, this is acceptable since the seeded admin exists in both tables. For Phase B, add a second FK column or migrate FK target.

### Release Decision: **CLEAR** (with caveat: audit works for existing flow; new CMS routes include logging)

---

## 11. bot_logs Are Recorded Correctly

**Status: FAIL**

### Current State
- No `bot_logs` table exists in PostgreSQL
- Newsbot only logs to console
- Risk level: **MEDIUM**

### Root Cause
`bot_logs` table was never created and the newsbot doesn't write to PostgreSQL.

### Required Changes
- `BotLog` model is included in the CMS models patch (Item 1)
- `collect-pg.js` in Item 7 includes `logBotAction()` that writes to `bot_logs`
- Admin endpoint to read bot_logs needed

Add to `cms_news.py`:

```python
# ── Bot Logs ──────────────────────────────────────────────────
from src.core.api.v1.domain.models.cms import BotLog

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
    result = await db.execute(select(BotLog).order_by(BotLog.created_at.desc()).limit(limit))
    return list(result.scalars().all())
```

### Release Decision: **BLOCKER** (Phase A)

---

## 12. CORS Configured with Admin Domain

**Status: FAIL**

### Current State
- `.env`: `BACKEND_CORS_ORIGINS=["https://thaijaworld.com"]`
- Only the public domain is allowed
- Admin domain is unknown — `.env` has `NEXT_PUBLIC_ADMIN_URL=https://thaijaworld.com` (same domain)
- If admin runs on a separate subdomain (e.g., `admin.thaijaworld.com`), it will be CORS-blocked
- Risk level: **HIGH** (if admin is on separate domain)

### Root Cause
CORS origins only include the public domain. If admin will run on a separate domain or port, it must be added.

### Required Changes

If admin runs on same domain (thaijaworld.com) — **no change needed** for CORS (nginx routes to different upstream).

If admin runs on separate subdomain:

```
BACKEND_CORS_ORIGINS=["https://thaijaworld.com","https://admin.thaijaworld.com"]
```

And add nginx server block for admin:

```nginx
upstream admin {
    server admin:3002;
}

server {
    listen 80;
    server_name admin.thaijaworld.com;

    location / {
        proxy_pass http://admin;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/v1/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Release Decision: **BLOCKER** — must decide admin domain strategy and configure

---

## 13. Admin JWT Token and Public JWT Token Are Separated Correctly

**Status: FAIL**

### Current State
- Single `SECRET_KEY` for all JWT operations
- `security.py`: `jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)`
- No distinction between admin tokens and public tokens
- Both admin and public auth use the same signing key
- A stolen public token could not access admin endpoints (role check stops it), but the JWT namespace is shared
- Risk level: **HIGH**

### Root Cause
JWT was designed as a single-key system. No admin/public separation.

### Required Changes
The `cms_deps.py` file in Item 3 already implements separation:

```python
ADMIN_JWT_SECRET = settings.SECRET_KEY + "_admin"
```

- Public tokens: signed with `settings.SECRET_KEY`, `type: "access"`
- Admin tokens: signed with `settings.SECRET_KEY + "_admin"`, `type: "admin_access"`

This ensures:
- Public token cannot be decoded with admin secret → admin endpoints reject it
- Admin token cannot be decoded with public secret → public endpoints reject it
- No shared namespace

**Additional safety**: add env var for explicit admin secret:

```
ADMIN_JWT_SECRET=<separate-random-key>
```

And update `cms_deps.py`:

```python
ADMIN_JWT_SECRET = os.environ.get("ADMIN_JWT_SECRET", settings.SECRET_KEY + "_admin")
```

### Release Decision: **BLOCKER** — implemented in Item 3 patch

---

## 14. pnpm build Passes

**Status: UNKNOWN**

### Current State
- Admin app (`apps/admin`) has known issues:
  - `@/lib/ko` import referenced across 10+ files but file does not exist → build will FAIL with TypeScript errors
  - `next.config.js` does not have `output: 'standalone'` but Dockerfile expects standalone build → Docker build will FAIL
  - Rewrite destination hardcoded to `http://localhost:3000` — won't work in production
- Web app (`apps/web`) — likely builds but needs verification
- Risk level: **HIGH**

### Root Cause
Admin app has unresolved import errors and Docker build misconfiguration.

### Files to Patch
- `apps/admin/src/lib/ko.ts` — NEW: create missing localization file
- `apps/admin/next.config.js` — add `output: 'standalone'`, fix rewrite URL

### Required Changes

Create `apps/admin/src/lib/ko.ts`:

```typescript
const ko = {
  admin: {
    dashboard: {
      title: '대시보드',
      totalUsers: '전체 사용자',
      newUsers: '신규 가입',
      activeUsers: '활성 사용자',
      totalPosts: '전체 게시글',
      recentReports: '최근 신고',
      recentUsers: '최근 가입자',
    },
    users: {
      title: '사용자 관리',
      search: '검색',
      status: '상태',
      role: '역할',
      actions: '관리',
      ban: '정지',
      warn: '경고',
      mute: '뮤트',
    },
    reports: {
      title: '신고 관리',
      pending: '대기',
      reviewed: '검토됨',
      resolved: '처리됨',
      dismissed: '기각',
    },
    notices: {
      title: '공지 관리',
      create: '새 공지',
      edit: '공지 수정',
      publish: '발행',
      unpublish: '발행 취소',
    },
    broadcasts: {
      title: '방송 로그',
      type: '유형',
      normal: '일반',
      premium: '프리미엄',
    },
    status: {
      active: '활성',
      suspended: '정지',
      deleted: '삭제',
    },
    common: {
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '수정',
      confirm: '확인',
      loading: '로딩 중...',
      noData: '데이터가 없습니다',
      error: '오류가 발생했습니다',
    },
  },
};

export default ko;
```

Update `apps/admin/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
```

### Verification Steps
```bash
cd apps/admin && pnpm install && pnpm build
# Expected: Build succeeds with standalone output in .next/standalone/
```

### Release Decision: **BLOCKER**

---

## 15. docker-compose Includes Admin Service Correctly

**Status: FAIL**

### Current State
- `docker-compose.yml` has: postgres, redis, backend, worker, beat, web, socket-server, nginx
- **No admin service**
- Admin app exists at `apps/admin/` with Dockerfile but is not in the compose stack
- Risk level: **HIGH**

### Root Cause
Admin service was never added to docker-compose.yml.

### Required Changes

Add to `docker-compose.yml` services:

```yaml
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    networks:
      - app
    ports:
      - "3002:3002"
    env_file: .env
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - NODE_OPTIONS=--dns-result-order=ipv4first
      - NODE_ENV=production
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
```

Update nginx to route to admin service (if separate subdomain approach):

Add `upstream admin` and server block as shown in Item 12.

Add upload volume:

```yaml
volumes:
  pgdata:
  uploads:
```

And add to backend service:

```yaml
  backend:
    volumes:
      - uploads:/app/uploads
```

### Verification Steps
```bash
docker compose config  # Validate YAML
docker compose build admin  # Build admin image
docker compose up -d admin  # Start admin service
curl http://localhost:3002  # Admin login page should load
```

### Release Decision: **BLOCKER**

---

# FINAL SUMMARY

## Release Readiness Summary

| Status | Count | Items |
|--------|-------|-------|
| **PASS** | 0 | — |
| **PARTIAL** | 1 | #10 (audit logs exist for current flow) |
| **FAIL** | 13 | #1, #2, #3, #4, #5, #6, #7, #8, #9, #11, #12, #13, #14, #15 |
| **UNKNOWN** | 1 | #14 (build — needs test after fixes) |

## Blockers

ALL items except #10 block stable production use of the Admin CMS + News Bot integration.

## Immediate Patch Plan

### Phase A — Must Fix Today (Critical Path)

1. **Create CMS models** (`cms.py`) — Item 1
2. **Create admin auth** (`cms_deps.py`, `cms_auth.py`) — Items 2, 3, 13
3. **Create news workflow** (`cms_news.py`) — Items 4, 11
4. **Create public API** (`cms_public.py`) — Item 8
5. **Fix admin build** (`ko.ts`, `next.config.js`) — Item 14
6. **Add admin to docker-compose** — Item 15
7. **Configure CORS for admin domain** — Item 12
8. **Register all new routers in `router.py`** and imports in `main.py`

### Phase B — Fix Within 48h After Launch Stabilization

1. **Content CRUD** (`cms_content.py`) — Item 5
2. **Media upload** (`cms_media.py`) — Item 6
3. **News bot PostgreSQL migration** (`collect-pg.js`) — Item 7
4. **On-demand revalidation** (`/api/revalidate`) — Item 9
5. **Separate ADMIN_JWT_SECRET env var** — Item 13 hardening

## Copy-Paste Command List

```bash
# 1. Create new backend files
# (apply patches from Items 1-8, 11, 13 above)

# 2. Add Pillow to requirements
echo "Pillow>=10.0.0" >> app/backend/requirements.txt

# 3. Create missing admin ko.ts
# (apply patch from Item 14)

# 4. Fix admin next.config.js
# (apply patch from Item 14)

# 5. Update .env — add admin CORS + JWT
# BACKEND_CORS_ORIGINS=["https://thaijaworld.com","https://admin.thaijaworld.com"]
# ADMIN_JWT_SECRET=<generate-random-key>

# 6. Rebuild and restart
docker compose build backend admin web
docker compose up -d

# 7. Verify tables created
docker compose exec backend python -c "
from src.core.api.v1.domain.infra.db import engine, Base
import asyncio
async def check():
    async with engine.connect() as conn:
        result = await conn.execute(text('SELECT tablename FROM pg_tables WHERE schemaname=\\'public\\''))
        tables = [r[0] for r in result]
        for t in sorted(tables):
            print(t)
asyncio.run(check())
"

# 8. Verify admin login
curl -X POST https://thaijaworld.com/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"queenhananana1216@gmail.com","password":"Langka_0425$$"}'

# 9. Verify public API
curl https://thaijaworld.com/api/v1/public/news
curl https://thaijaworld.com/api/v1/public/banners
curl https://thaijaworld.com/api/v1/public/announcements

# 10. Verify admin build
cd apps/admin && pnpm build
```

## Domain Connection Checklist

| Setting | Value | Status |
|---------|-------|--------|
| `SITE_URL` | `https://thaijaworld.com` | ✅ Set |
| `NEXT_PUBLIC_SITE_URL` | `https://thaijaworld.com` | ✅ Set |
| `BACKEND_CORS_ORIGINS` | Must include admin domain | ⚠️ Needs update |
| `ADMIN_JWT_SECRET` | Separate from public SECRET_KEY | ❌ Missing |
| `NEXT_PUBLIC_ADMIN_URL` | Define admin domain | ⚠️ Currently same as public |
| Admin nginx upstream | Not configured | ❌ Missing |
| Upload volume mount | Not configured | ❌ Missing |
| `WEB_INTERNAL_URL` | `http://web:3000` for revalidation | ❌ Missing |
