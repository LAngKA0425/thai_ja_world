from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.core.api.v1.domain.infra.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    nickname: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active/suspended/deleted
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    phone_normalized: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    duplicate_phone_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    auth_provider: Mapped[str] = mapped_column(String(30), nullable=False, default="password")
    signup_risk_level: Mapped[str] = mapped_column(String(20), nullable=False, default="low")
    signup_risk_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    signup_risk_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    suspicious_signup: Mapped[bool] = mapped_column(Boolean, default=False)
    admin_review_required: Mapped[bool] = mapped_column(Boolean, default=False)
    blocked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    gem_balance: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_banned: Mapped[bool] = mapped_column(Boolean, default=False)
    banned_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    banned_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    last_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    last_user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    device_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
