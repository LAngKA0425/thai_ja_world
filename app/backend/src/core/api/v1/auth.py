from __future__ import annotations

import hashlib
import re
import uuid

from fastapi import APIRouter, Depends, Header, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone

from src.core.anti_abuse import LoginContext, SignupContext, evaluate_login, evaluate_signup
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.models.email_verification_token import EmailVerificationToken
from src.core.api.v1.domain.models.admin import AdminNotification
from src.core.api.v1.deps import get_current_user
from src.core.errors import bad_request, forbidden, unauthorized
from src.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from src.core.api.v1.domain.minihome.minihome_service import MinihomeService
from src.core.api.v1.domain.points.points_service import PointsService

router = APIRouter(prefix="/auth", tags=["auth"])


def normalize_phone(phone: str | None) -> str | None:
    if not phone:
        return None
    digits = re.sub(r"[^0-9+]", "", phone)
    if digits.startswith("0") and len(digits) >= 9:
        digits = "+66" + digits[1:]
    return digits if digits else None


class RegisterRequest(BaseModel):
    email: EmailStr
    nickname: str
    password: str
    phone: str | None = None
    captcha_token: str | None = None
    email_verification_code: str | None = None
    phone_verification_code: str | None = None
    passkey_credential: dict | None = None

    model_config = {"extra": "ignore"}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    captcha_token: str | None = None
    passkey_credential: dict | None = None

    model_config = {"extra": "ignore"}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    nickname: str
    role: str
    is_banned: bool

    model_config = {"from_attributes": True}


def _get_device_hash(request: Request) -> str | None:
    for header in ("x-device-hash", "x-device-id", "x-device-fingerprint"):
        value = request.headers.get(header)
        if value:
            return value[:128]
    return None


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(body: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    exists = await db.execute(select(User).where((User.email == body.email) | (User.nickname == body.nickname)))
    if exists.scalar_one_or_none():
        raise bad_request("DUPLICATE", "이미 사용 중인 이메일 또는 닉네임입니다")

    phone_norm = normalize_phone(body.phone)
    dup_flag = False

    if phone_norm:
        dup_result = await db.execute(select(User).where(User.phone_normalized == phone_norm))
        existing_dup = dup_result.scalar_one_or_none()
        if existing_dup:
            dup_flag = True

    device_hash = _get_device_hash(request)
    signup_decision = await evaluate_signup(
        SignupContext(
            email=body.email,
            nickname=body.nickname,
            phone=body.phone,
            ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
            device_hash=device_hash,
            captcha_token=body.captcha_token,
        )
    )
    if not signup_decision.allow:
        raise forbidden(signup_decision.reason or "회원가입이 제한되었습니다")

    user = User(
        email=body.email,
        nickname=body.nickname,
        hashed_password=hash_password(body.password),
        phone=body.phone,
        phone_normalized=phone_norm,
        duplicate_phone_flag=dup_flag,
        email_verified=False,
        phone_verified=False,
        auth_provider="password",
        signup_risk_level=signup_decision.risk_level or "low",
        signup_risk_score=signup_decision.risk_score,
        signup_risk_reason=signup_decision.reason,
        suspicious_signup=signup_decision.suspicious,
        admin_review_required=signup_decision.admin_review_required,
        blocked_until=signup_decision.blocked_until,
        last_ip=request.client.host if request.client else None,
        last_user_agent=request.headers.get("user-agent", "")[:500],
        device_hash=device_hash,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    if dup_flag:
        existing_dup.duplicate_phone_flag = True
        notif = AdminNotification(
            type="duplicate_phone",
            severity="warn",
            title=f"중복 번호 감지: {phone_norm} (신규: {body.nickname})",
            payload={"new_user_id": str(user.id), "existing_user_id": str(existing_dup.id), "phone": phone_norm},
        )
        db.add(notif)

    if signup_decision.suspicious or signup_decision.admin_review_required:
        notif = AdminNotification(
            type="suspicious_signup",
            severity="warn",
            title=f"의심 회원가입 감지: {body.nickname}",
            payload={
                "user_id": str(user.id),
                "email": body.email,
                "risk_level": signup_decision.risk_level,
                "risk_score": signup_decision.risk_score,
                "reason": signup_decision.reason,
            },
        )
        db.add(notif)

    # 미니홈피 자동 생성 (중복 생성 방지는 service 내부에서 처리)
    minihome_service = MinihomeService(db)
    try:
        await minihome_service.create_profile(
            user_id=user.id,
            owner_nickname=body.nickname,
            title=f"{body.nickname}의 미니홈피",
            description="",
            skin_id="default",
        )
    except Exception:
        pass

    # 포인트/젬 영속 잔액 레코드 초기화
    points_service = PointsService(db)
    await points_service.get_user_balance(user.id)

    return user


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise unauthorized("이메일 또는 비밀번호가 올바르지 않습니다")
    if not user.email_verified:
        raise forbidden("이메일 인증이 필요합니다. 메일함을 확인해주세요.")
    if user.blocked_until and user.blocked_until > datetime.now(timezone.utc):
        raise forbidden("계정이 일시적으로 제한되었습니다")

    login_decision = await evaluate_login(
        LoginContext(
            email=body.email,
            ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
            device_hash=_get_device_hash(request),
            captcha_token=body.captcha_token,
        )
    )
    if not login_decision.allow:
        raise forbidden(login_decision.reason or "로그인이 제한되었습니다")
    if login_decision.blocked_until:
        user.blocked_until = login_decision.blocked_until
        raise forbidden("계정이 일시적으로 제한되었습니다")
    if login_decision.suspicious or login_decision.admin_review_required:
        user.admin_review_required = True

    user.last_login_at = datetime.now(timezone.utc)
    user.last_login_ip = request.client.host if request.client else None
    user.last_ip = request.client.host if request.client else None
    user.last_user_agent = request.headers.get("user-agent", "")[:500]
    device_hash = _get_device_hash(request)
    if device_hash:
        user.device_hash = device_hash
    return TokenResponse(
        access_token=create_access_token(str(user.id), nickname=user.nickname),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    if not authorization.startswith("Bearer "):
        raise unauthorized()
    token = authorization.removeprefix("Bearer ")
    payload = decode_token(token)
    sub = payload.get("sub")
    token_type = payload.get("type")
    if not sub or token_type != "refresh":
        raise unauthorized("유효하지 않은 리프레시 토큰입니다")

    try:
        subject_id = uuid.UUID(sub)
    except ValueError:
        raise unauthorized("유효하지 않은 리프레시 토큰입니다")

    user_result = await db.execute(select(User).where(User.id == subject_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise unauthorized("유효하지 않은 리프레시 토큰입니다")

    return TokenResponse(
        access_token=create_access_token(sub, nickname=user.nickname),
        refresh_token=create_refresh_token(sub),
    )


@router.get("/me")
async def me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from src.core.api.v1.domain.points.points_service import PointsService as _PS
    balance = None
    try:
        ps = _PS(db)
        balance = await ps.get_user_balance(current_user.id)
    except Exception:
        pass
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "nickname": current_user.nickname,
        "role": current_user.role,
        "is_banned": current_user.is_banned,
        "email_verified": current_user.email_verified,
        "points": balance.available_points if balance else 0,
        "gems": current_user.gem_balance,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


# ── Internal endpoints (Next.js -> FastAPI server-to-server) ──


class VerifyEmailInternalRequest(BaseModel):
    user_id: str
    internal_secret: str


class UserByEmailInternalRequest(BaseModel):
    email: str
    internal_secret: str


class CreateEmailVerificationTokenInternalRequest(BaseModel):
    user_id: str
    email: EmailStr
    token: str
    expires_in_hours: int = 24
    internal_secret: str


class VerifyEmailTokenInternalRequest(BaseModel):
    token: str
    internal_secret: str


@router.post("/verify-email-internal")
async def verify_email_internal(body: VerifyEmailInternalRequest, db: AsyncSession = Depends(get_db)):
    from src.core.config import settings as _s
    if body.internal_secret != _s.SECRET_KEY:
        raise unauthorized("Invalid internal secret")
    try:
        uid = uuid.UUID(body.user_id)
    except ValueError:
        raise bad_request("INVALID_ID", "유효하지 않은 사용자 ID입니다")
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        raise bad_request("NOT_FOUND", "사용자를 찾을 수 없습니다")
    user.email_verified = True
    return {"success": True, "message": "이메일 인증이 완료되었습니다"}


@router.post("/create-email-verification-token-internal")
async def create_email_verification_token_internal(
    body: CreateEmailVerificationTokenInternalRequest,
    db: AsyncSession = Depends(get_db),
):
    from src.core.config import settings as _s

    if body.internal_secret != _s.SECRET_KEY:
        raise unauthorized("Invalid internal secret")

    try:
        uid = uuid.UUID(body.user_id)
    except ValueError:
        raise bad_request("INVALID_ID", "유효하지 않은 사용자 ID입니다")

    user_result = await db.execute(select(User).where(User.id == uid))
    user = user_result.scalar_one_or_none()
    if not user:
        raise bad_request("NOT_FOUND", "사용자를 찾을 수 없습니다")

    token_hash = hashlib.sha256(body.token.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=max(1, body.expires_in_hours))

    await db.execute(delete(EmailVerificationToken).where(EmailVerificationToken.user_id == uid))

    db.add(
        EmailVerificationToken(
            user_id=uid,
            email=body.email,
            token_hash=token_hash,
            expires_at=expires_at,
        )
    )

    return {
        "success": True,
        "user_id": str(uid),
        "expires_at": expires_at.isoformat(),
    }


@router.post("/verify-email-token-internal")
async def verify_email_token_internal(body: VerifyEmailTokenInternalRequest, db: AsyncSession = Depends(get_db)):
    from src.core.config import settings as _s

    if body.internal_secret != _s.SECRET_KEY:
        raise unauthorized("Invalid internal secret")

    token_hash = hashlib.sha256(body.token.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)

    token_result = await db.execute(
        select(EmailVerificationToken).where(EmailVerificationToken.token_hash == token_hash)
    )
    token_row = token_result.scalar_one_or_none()
    if not token_row:
        raise bad_request("INVALID_TOKEN", "유효하지 않은 인증 토큰입니다")

    if token_row.used_at is not None:
        raise bad_request("USED_TOKEN", "이미 사용된 인증 토큰입니다")

    if now > token_row.expires_at:
        await db.delete(token_row)
        raise bad_request("EXPIRED_TOKEN", "인증 토큰이 만료되었습니다")

    user_result = await db.execute(select(User).where(User.id == token_row.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        await db.delete(token_row)
        raise bad_request("NOT_FOUND", "사용자를 찾을 수 없습니다")

    user.email_verified = True
    token_row.used_at = now

    return {
        "success": True,
        "message": "이메일 인증이 완료되었습니다",
        "user_id": str(user.id),
        "email": user.email,
    }


@router.post("/user-by-email-internal")
async def user_by_email_internal(body: UserByEmailInternalRequest, db: AsyncSession = Depends(get_db)):
    from src.core.config import settings as _s
    if body.internal_secret != _s.SECRET_KEY:
        raise unauthorized("Invalid internal secret")
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        return {"found": False}
    return {
        "found": True,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "nickname": user.nickname,
            "email_verified": user.email_verified,
        },
    }


# ── Gem Economy ──

class GemBalanceResponse(BaseModel):
    gem_balance: int
    model_config = {"from_attributes": True}


class GemUseRequest(BaseModel):
    amount: int
    reason: str = ""


class GemUseResponse(BaseModel):
    success: bool
    remaining: int


@router.get("/me/gems", response_model=GemBalanceResponse)
async def get_my_gems(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    points = PointsService(db)
    balance = await points.get_user_balance(current_user.id)
    return GemBalanceResponse(gem_balance=balance.available_points)


@router.post("/me/gems/use", response_model=GemUseResponse)
async def use_gems(
    body: GemUseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.amount <= 0:
        raise bad_request("INVALID_AMOUNT", "사용 젬 수는 0보다 커야 합니다")

    points = PointsService(db)
    try:
        await points.spend_points(
            user_id=current_user.id,
            amount=body.amount,
            reason=body.reason or "젬 사용",
            source_type="shop",
        )
    except ValueError:
        raise bad_request("INSUFFICIENT_GEMS", "젬이 부족합니다")

    updated = await points.get_user_balance(current_user.id)
    return GemUseResponse(success=True, remaining=updated.available_points)
