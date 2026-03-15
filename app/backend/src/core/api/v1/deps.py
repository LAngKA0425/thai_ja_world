from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.errors import forbidden, unauthorized
from src.core.security import decode_token


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise unauthorized()
    token = authorization.removeprefix("Bearer ")
    payload = decode_token(token)
    sub = payload.get("sub")
    token_type = payload.get("type")
    if not sub or token_type != "access":
        raise unauthorized()
    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        raise unauthorized()
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise unauthorized()
    if user.is_banned:
        now = datetime.now(timezone.utc)
        if user.banned_until is None or user.banned_until > now:
            raise forbidden("계정이 정지되었습니다")
    if user.blocked_until:
        now = datetime.now(timezone.utc)
        if user.blocked_until > now:
            raise forbidden("계정이 일시적으로 제한되었습니다")
    return user


async def require_moderator(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in ("moderator", "admin"):
        raise forbidden()
    return current_user


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "admin":
        raise forbidden()
    return current_user
