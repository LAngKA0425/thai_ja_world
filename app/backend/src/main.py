from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text

from src.core.api.v1.domain.infra.db import Base, engine, async_session
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.models.email_verification_token import EmailVerificationToken
from src.core.api.v1.domain.models.post import Post, Comment, PostLike, Bookmark
from src.core.api.v1.domain.models.moderation import Report, BannedKeyword, UserBlock
from src.core.api.v1.domain.models.admin import (
    IngestedSource, IngestedDraft, ScheduledPost,
    AdminAuditLog, AdminNotification, UserReport,
)
from src.core.api.v1.domain.points.points_repository import PointBalance, PointTransaction
from src.core.api.v1.domain.quests.quests_repository import QuestDefinition, UserQuestState
from src.core.api.v1.domain.minihome.minihome_repository import MinihomeProfile, GuestbookEntry, MinihomeAlbum, MinihomeVisitLog, MinihomeBgm
from src.core.api.v1.domain.miniroom.miniroom_repository import MiniroomObject, MiniroomInteractionLog
from src.core.api.v1.domain.shop.shop_repository import ShopItem, PurchaseLog, UserShopInventory
from src.core.api.v1.domain.reservations.reservations_repository import ReservationShop, ReservationSlot, Reservation, ReservationPointUsage
from src.core.api.v1.domain.models.cms import (
    AdminUser, Role, Permission, RolePermission,
    NewsCategory, NewsSource, NewsArticle, BotLog, SystemSetting,
)
from src.core.api.v1.router import api_router
from src.core.config import settings
from src.core.security import hash_password
from src.core.rate_limit import RateLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed admin
    async with async_session() as db:
        result = await db.execute(select(User).where(User.email == settings.FIRST_ADMIN_EMAIL))
        if not result.scalar_one_or_none():
            admin = User(
                email=settings.FIRST_ADMIN_EMAIL,
                nickname="admin",
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role="admin",
            )
            db.add(admin)
            await db.commit()

    # Seed super_admin role + account in admin_users
    async with async_session() as db:
        result = await db.execute(select(Role).where(Role.name == "super_admin"))
        sa_role = result.scalar_one_or_none()
        if not sa_role:
            sa_role = Role(name="super_admin", description="전체 시스템 접근 권한")
            db.add(sa_role)
            await db.flush()

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
                db.add(RolePermission(role_id=sa_role.id, permission_id=perm.id))
            await db.flush()

        result = await db.execute(select(AdminUser).where(AdminUser.email == settings.FIRST_ADMIN_EMAIL))
        if not result.scalar_one_or_none():
            admin_user = AdminUser(
                email=settings.FIRST_ADMIN_EMAIL,
                nickname="super_admin",
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role_id=sa_role.id,
                is_active=True,
            )
            db.add(admin_user)
        await db.commit()

    # Seed baseline shop items if table is empty.
    async with async_session() as db:
        item_count = await db.execute(select(ShopItem.id).limit(1))
        if item_count.scalar_one_or_none() is None:
            seed_items = [
                {"name": "봄꽃 스킨", "description": "미니홈피 봄 테마", "category": "minihome_skin", "price": 120, "image_url": "https://cdn.taeja.local/skins/spring.png"},
                {"name": "노을 스킨", "description": "미니홈피 노을 테마", "category": "minihome_skin", "price": 150, "image_url": "https://cdn.taeja.local/skins/sunset.png"},
                {"name": "밤바다 BGM", "description": "잔잔한 밤바다 분위기", "category": "bgm", "price": 80, "image_url": "https://cdn.taeja.local/bgm/night-sea.mp3"},
                {"name": "시티팝 BGM", "description": "경쾌한 시티팝", "category": "bgm", "price": 90, "image_url": "https://cdn.taeja.local/bgm/city-pop.mp3"},
                {"name": "골드 닉네임", "description": "닉네임 색상 골드", "category": "nickname_color", "price": 60, "image_url": "https://cdn.taeja.local/items/nickname-gold.png"},
                {"name": "별빛 이모지", "description": "채팅용 별빛 이모지", "category": "emoji", "price": 35, "image_url": "https://cdn.taeja.local/items/emoji-star.png"},
                {"name": "여행자 뱃지", "description": "프로필 여행자 뱃지", "category": "badge", "price": 50, "image_url": "https://cdn.taeja.local/items/badge-travel.png"},
                {"name": "소파 미니룸", "description": "미니룸 소파 오브젝트", "category": "miniroom_item", "price": 110, "image_url": "https://cdn.taeja.local/items/miniroom-sofa.png"},
                {"name": "하늘 배경", "description": "미니룸 하늘 배경", "category": "miniroom_item", "price": 140, "image_url": "https://cdn.taeja.local/items/miniroom-sky.png"},
                {"name": "아바타 입문팩", "description": "아바타 꾸미기 입문 세트", "category": "avatar", "price": 100, "image_url": "https://cdn.taeja.local/items/avatar-starter.png"},
            ]
            for item in seed_items:
                db.add(ShopItem(**item))
            await db.commit()
    yield
    await engine.dispose()


app = FastAPI(title="Taeja API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)
app.include_router(api_router)
