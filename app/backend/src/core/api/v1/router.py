from __future__ import annotations

from fastapi import APIRouter

from src.core.api.v1.auth import router as auth_router
from src.core.api.v1.health import router as health_router
from src.core.api.v1.moderation import router as moderation_router
from src.core.api.v1.posts import router as posts_router
from src.core.api.v1.admin import router as admin_router
from src.core.api.v1.domain.points.points_router import router as points_router
from src.core.api.v1.domain.quests.quests_router import router as quests_router
from src.core.api.v1.domain.minihome.minihome_router import router as minihome_router
from src.core.api.v1.domain.miniroom.miniroom_router import router as miniroom_router
from src.core.api.v1.domain.shop.shop_router import router as shop_router
from src.core.api.v1.domain.reservations.reservations_router import router as reservations_router
from src.core.api.v1.domain.avatar.avatar_router import router as avatar_router
from src.core.api.v1.domain.guestbook.guestbook_router import router as guestbook_router
from src.core.api.v1.domain.albums.albums_router import router as albums_router
from src.core.api.v1.domain.ilchon.ilchon_router import router as ilchon_router
from src.core.api.v1.domain.notifications.notifications_router import router as notifications_router
from src.core.api.v1.cms_auth import router as cms_auth_router
from src.core.api.v1.cms_news import router as cms_news_router
from src.core.api.v1.cms_public import router as cms_public_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(posts_router)
api_router.include_router(moderation_router)
api_router.include_router(admin_router)
api_router.include_router(points_router)
api_router.include_router(quests_router)
api_router.include_router(minihome_router)
api_router.include_router(miniroom_router)
api_router.include_router(shop_router)
api_router.include_router(reservations_router)
api_router.include_router(avatar_router)
api_router.include_router(guestbook_router)
api_router.include_router(albums_router)
api_router.include_router(ilchon_router)
api_router.include_router(notifications_router)
api_router.include_router(cms_auth_router)
api_router.include_router(cms_news_router)
api_router.include_router(cms_public_router)
