"""
Admin CMS 전용 인증 의존성.
public JWT(SECRET_KEY)와 분리된 ADMIN_JWT_SECRET 사용.
"""
from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Depends, Header
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.cms import AdminUser, Role, RolePermission, Permission
from src.core.config import settings
from src.core.errors import forbidden, unauthorized

ALGORITHM = "HS256"

# public SECRET_KEY 와 절대 동일하면 안 됨
ADMIN_JWT_SECRET: str = os.environ.get("ADMIN_JWT_SECRET", settings.SECRET_KEY + "__admin_ns")


# ── 토큰 생성 / 디코딩 ────────────────────────────────────────
def create_admin_access_token(subject: str, nickname: str | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict = {"sub": subject, "exp": expire, "type": "admin_access"}
    if nickname:
        payload["nickname"] = nickname
    return jwt.encode(payload, ADMIN_JWT_SECRET, algorithm=ALGORITHM)


def decode_admin_token(token: str) -> dict:
    try:
        return jwt.decode(token, ADMIN_JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return {}


# ── 현재 관리자 조회 ──────────────────────────────────────────
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


# ── 권한 체크 (super_admin 은 전체 허용) ──────────────────────
async def require_permission(
    permission_name: str,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminUser:
    if admin.role_id is None:
        raise forbidden("역할이 할당되지 않았습니다")

    # super_admin 역할은 모든 권한 통과
    role_result = await db.execute(select(Role.name).where(Role.id == admin.role_id))
    role_name = role_result.scalar_one_or_none()
    if role_name == "super_admin":
        return admin

    # 일반 역할 — 구체적 권한 확인
    result = await db.execute(
        select(Permission.name)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == admin.role_id)
    )
    perms = {row[0] for row in result.all()}
    if permission_name not in perms:
        raise forbidden("권한이 없습니다")
    return admin
