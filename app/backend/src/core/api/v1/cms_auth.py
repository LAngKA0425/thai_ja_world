"""
Admin CMS 전용 인증 엔드포인트.
경로: /api/v1/admin/auth/*
"""
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


# ── 스키마 ─────────────────────────────────────────────────────
class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminUserOut(BaseModel):
    id: str
    email: str
    nickname: str
    isAdmin: bool = True


class AdminLoginResponse(BaseModel):
    token: str
    user: AdminUserOut


class AdminMeResponse(BaseModel):
    id: str
    email: str
    nickname: str
    is_active: bool


# ── 엔드포인트 ─────────────────────────────────────────────────
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
        user=AdminUserOut(id=str(admin.id), email=admin.email, nickname=admin.nickname),
    )


@router.get("/me", response_model=AdminMeResponse)
async def admin_me(admin: AdminUser = Depends(get_current_admin)):
    return AdminMeResponse(
        id=str(admin.id),
        email=admin.email,
        nickname=admin.nickname,
        is_active=admin.is_active,
    )
