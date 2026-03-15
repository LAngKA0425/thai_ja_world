from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel
from sqlalchemy import and_, func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import require_admin
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.admin import (
    AdminAuditLog,
    AdminNotification,
    IngestedDraft,
    IngestedSource,
    ScheduledPost,
    UserReport,
)
from src.core.api.v1.domain.models.post import Post
from src.core.api.v1.domain.models.user import User
from src.core.errors import bad_request, not_found

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Helpers ──────────────────────────────────────────────────
async def write_audit(db: AsyncSession, admin_id: uuid.UUID, action: str, target_type: str, target_id: str, payload: dict | None = None):
    log = AdminAuditLog(admin_user_id=admin_id, action=action, target_type=target_type, target_id=target_id, payload=payload)
    db.add(log)


async def create_notification(db: AsyncSession, ntype: str, severity: str, title: str, payload: dict | None = None):
    n = AdminNotification(type=ntype, severity=severity, title=title, payload=payload)
    db.add(n)


# ── Dashboard ────────────────────────────────────────────────
class DashboardStats(BaseModel):
    today_scheduled: int
    today_published: int
    today_failed: int
    unread_notifications: int
    total_users: int
    new_users_24h: int


@router.get("/dashboard", response_model=DashboardStats)
async def dashboard(db: AsyncSession = Depends(get_db), _admin: User = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    scheduled_today = await db.execute(
        select(func.count()).select_from(ScheduledPost).where(
            and_(ScheduledPost.publish_at >= today_start, ScheduledPost.status == "scheduled")
        )
    )
    published_today = await db.execute(
        select(func.count()).select_from(ScheduledPost).where(
            and_(ScheduledPost.publish_at >= today_start, ScheduledPost.status == "published")
        )
    )
    failed_today = await db.execute(
        select(func.count()).select_from(ScheduledPost).where(
            and_(ScheduledPost.publish_at >= today_start, ScheduledPost.status == "failed")
        )
    )
    unread = await db.execute(
        select(func.count()).select_from(AdminNotification).where(AdminNotification.is_read == False)
    )
    total_users = await db.execute(select(func.count()).select_from(User))
    new_24h = await db.execute(
        select(func.count()).select_from(User).where(User.created_at >= today_start)
    )

    return DashboardStats(
        today_scheduled=scheduled_today.scalar_one(),
        today_published=published_today.scalar_one(),
        today_failed=failed_today.scalar_one(),
        unread_notifications=unread.scalar_one(),
        total_users=total_users.scalar_one(),
        new_users_24h=new_24h.scalar_one(),
    )


# ── Ingest Sources ───────────────────────────────────────────
class SourceCreate(BaseModel):
    name: str
    type: str
    url: str
    fetch_interval_minutes: int = 60


class SourceOut(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    url: str
    is_enabled: bool
    fetch_interval_minutes: int
    last_fetched_at: datetime | None
    created_at: datetime
    model_config = {"from_attributes": True}


@router.get("/sources", response_model=list[SourceOut])
async def list_sources(db: AsyncSession = Depends(get_db), _admin: User = Depends(require_admin)):
    result = await db.execute(select(IngestedSource).order_by(IngestedSource.created_at.desc()))
    return list(result.scalars().all())


@router.post("/sources", response_model=SourceOut, status_code=201)
async def create_source(body: SourceCreate, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)):
    src = IngestedSource(name=body.name, type=body.type, url=body.url, fetch_interval_minutes=body.fetch_interval_minutes)
    db.add(src)
    await db.flush()
    await db.refresh(src)
    await write_audit(db, admin.id, "create_source", "ingested_source", str(src.id))
    return src


# ── Ingest Drafts ────────────────────────────────────────────
class DraftOut(BaseModel):
    id: uuid.UUID
    source_id: uuid.UUID
    external_id: str | None
    title: str
    body: str
    summary: str | None
    status: str
    hash: str
    created_at: datetime
    model_config = {"from_attributes": True}


class DraftAction(BaseModel):
    action: str  # approve/reject/edit
    title: str | None = None
    body: str | None = None
    summary: str | None = None
    publish_at: datetime | None = None  # for approve


@router.get("/drafts", response_model=list[DraftOut])
async def list_drafts(
    status: str | None = None,
    source_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    stmt = select(IngestedDraft).order_by(IngestedDraft.created_at.desc())
    if status:
        stmt = stmt.where(IngestedDraft.status == status)
    if source_id:
        stmt = stmt.where(IngestedDraft.source_id == source_id)
    result = await db.execute(stmt.limit(100))
    return list(result.scalars().all())


@router.post("/drafts/{draft_id}/action")
async def draft_action(
    draft_id: uuid.UUID,
    body: DraftAction,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(IngestedDraft).where(IngestedDraft.id == draft_id))
    draft = result.scalar_one_or_none()
    if not draft:
        raise not_found()

    if body.action == "reject":
        draft.status = "rejected"
        await write_audit(db, admin.id, "reject_draft", "ingested_draft", str(draft_id))
        return {"ok": True}

    if body.action == "edit":
        if body.title:
            draft.title = body.title
        if body.body:
            draft.body = body.body
        if body.summary:
            draft.summary = body.summary
        draft.status = "reviewed"
        await write_audit(db, admin.id, "edit_draft", "ingested_draft", str(draft_id))
        return {"ok": True}

    if body.action == "approve":
        draft.status = "converted"
        # Default 09:00 Bangkok tomorrow
        from datetime import timedelta
        if body.publish_at:
            pub_time = body.publish_at
        else:
            tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
            pub_time = tomorrow.replace(hour=2, minute=0, second=0, microsecond=0)  # 09:00 Bangkok = 02:00 UTC

        scheduled = ScheduledPost(
            status="scheduled",
            publish_at=pub_time,
            post_payload={"type": "tip", "title": draft.title, "body": draft.body, "area": None, "tags": "뉴스"},
            source_draft_id=draft.id,
        )
        db.add(scheduled)
        await db.flush()
        await write_audit(db, admin.id, "approve_draft", "ingested_draft", str(draft_id), {"scheduled_id": str(scheduled.id)})
        return {"ok": True, "scheduled_id": str(scheduled.id)}

    raise bad_request("INVALID_ACTION", "유효하지 않은 액션입니다")


# ── Scheduled Posts ──────────────────────────────────────────
class ScheduledOut(BaseModel):
    id: uuid.UUID
    status: str
    publish_at: datetime
    post_payload: dict
    source_draft_id: uuid.UUID | None
    published_post_id: uuid.UUID | None
    error: str | None
    retry_count: int
    created_at: datetime
    model_config = {"from_attributes": True}


class ScheduledUpdate(BaseModel):
    publish_at: datetime | None = None
    status: str | None = None  # canceled/scheduled
    post_payload: dict | None = None


@router.get("/scheduled", response_model=list[ScheduledOut])
async def list_scheduled(
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    stmt = select(ScheduledPost).order_by(ScheduledPost.publish_at.desc())
    if status:
        stmt = stmt.where(ScheduledPost.status == status)
    result = await db.execute(stmt.limit(100))
    return list(result.scalars().all())


@router.patch("/scheduled/{scheduled_id}", response_model=ScheduledOut)
async def update_scheduled(
    scheduled_id: uuid.UUID,
    body: ScheduledUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(ScheduledPost).where(ScheduledPost.id == scheduled_id))
    sp = result.scalar_one_or_none()
    if not sp:
        raise not_found()
    if body.publish_at is not None:
        sp.publish_at = body.publish_at
    if body.status is not None:
        sp.status = body.status
    if body.post_payload is not None:
        sp.post_payload = body.post_payload
    await db.flush()
    await db.refresh(sp)
    await write_audit(db, admin.id, "update_scheduled", "scheduled_post", str(scheduled_id))
    return sp


@router.post("/scheduled/{scheduled_id}/publish-now")
async def publish_now(
    scheduled_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(ScheduledPost).where(ScheduledPost.id == scheduled_id))
    sp = result.scalar_one_or_none()
    if not sp:
        raise not_found()
    if sp.status in ("published", "canceled"):
        raise bad_request("INVALID_STATUS", "이미 발행되었거나 취소된 글입니다")

    # Create post directly
    payload = sp.post_payload
    post = Post(
        author_id=admin.id,
        type=payload.get("type", "tip"),
        title=payload.get("title", ""),
        body=payload.get("body", ""),
        area=payload.get("area"),
        tags=payload.get("tags"),
        images=payload.get("images"),
    )
    db.add(post)
    await db.flush()
    sp.status = "published"
    sp.published_post_id = post.id
    await write_audit(db, admin.id, "publish_now", "scheduled_post", str(scheduled_id))
    return {"ok": True, "post_id": str(post.id)}


# ── Users Management ─────────────────────────────────────────
class UserDetailOut(BaseModel):
    id: uuid.UUID
    email: str
    nickname: str
    role: str
    status: str
    phone: str | None
    phone_normalized: str | None
    duplicate_phone_flag: bool
    email_verified: bool
    phone_verified: bool
    auth_provider: str
    signup_risk_level: str
    signup_risk_score: int
    signup_risk_reason: str | None
    suspicious_signup: bool
    admin_review_required: bool
    blocked_until: datetime | None
    admin_note: str | None
    is_banned: bool
    banned_reason: str | None
    last_login_at: datetime | None
    last_login_ip: str | None
    last_ip: str | None
    device_hash: str | None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class UserListOut(BaseModel):
    items: list[UserDetailOut]
    total: int


class UserUpdateAdmin(BaseModel):
    status: str | None = None
    role: str | None = None
    admin_note: str | None = None
    is_banned: bool | None = None
    banned_reason: str | None = None
    email_verified: bool | None = None
    phone_verified: bool | None = None
    signup_risk_level: str | None = None
    signup_risk_score: int | None = None
    signup_risk_reason: str | None = None
    suspicious_signup: bool | None = None
    admin_review_required: bool | None = None
    blocked_until: datetime | None = None


@router.get("/users", response_model=UserListOut)
async def list_users(
    q: str | None = None,
    role: str | None = None,
    status: str | None = None,
    duplicate_phone: bool | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    stmt = select(User).order_by(User.created_at.desc())
    count_stmt = select(func.count()).select_from(User)

    if q:
        like = f"%{q}%"
        filt = or_(User.email.ilike(like), User.nickname.ilike(like), User.phone.ilike(like), User.phone_normalized.ilike(like))
        stmt = stmt.where(filt)
        count_stmt = count_stmt.where(filt)
    if role:
        stmt = stmt.where(User.role == role)
        count_stmt = count_stmt.where(User.role == role)
    if status:
        stmt = stmt.where(User.status == status)
        count_stmt = count_stmt.where(User.status == status)
    if duplicate_phone is not None:
        stmt = stmt.where(User.duplicate_phone_flag == duplicate_phone)
        count_stmt = count_stmt.where(User.duplicate_phone_flag == duplicate_phone)

    total = (await db.execute(count_stmt)).scalar_one()
    offset = (page - 1) * limit
    result = await db.execute(stmt.offset(offset).limit(limit))
    return UserListOut(items=list(result.scalars().all()), total=total)


@router.get("/users/{user_id}", response_model=UserDetailOut)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db), _admin: User = Depends(require_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise not_found()
    return user


@router.get("/users/{user_id}/duplicates", response_model=list[UserDetailOut])
async def get_user_duplicates(user_id: uuid.UUID, db: AsyncSession = Depends(get_db), _admin: User = Depends(require_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.phone_normalized:
        return []
    dups = await db.execute(
        select(User).where(and_(User.phone_normalized == user.phone_normalized, User.id != user_id))
    )
    return list(dups.scalars().all())


@router.patch("/users/{user_id}", response_model=UserDetailOut)
async def update_user_admin(
    user_id: uuid.UUID,
    body: UserUpdateAdmin,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise not_found()
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.flush()
    await db.refresh(user)
    await write_audit(db, admin.id, "update_user", "user", str(user_id), body.model_dump(exclude_unset=True))
    return user


# ── Notifications ────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: uuid.UUID
    type: str
    severity: str
    title: str
    payload: dict | None
    is_read: bool
    created_at: datetime
    model_config = {"from_attributes": True}


@router.get("/notifications", response_model=list[NotificationOut])
async def list_notifications(
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    stmt = select(AdminNotification).order_by(AdminNotification.created_at.desc())
    if unread_only:
        stmt = stmt.where(AdminNotification.is_read == False)
    result = await db.execute(stmt.limit(50))
    return list(result.scalars().all())


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(AdminNotification).where(AdminNotification.id == notification_id))
    n = result.scalar_one_or_none()
    if not n:
        raise not_found()
    n.is_read = True
    return {"ok": True}


@router.post("/notifications/read-all")
async def mark_all_read(db: AsyncSession = Depends(get_db), _admin: User = Depends(require_admin)):
    from sqlalchemy import update
    await db.execute(update(AdminNotification).where(AdminNotification.is_read == False).values(is_read=True))
    return {"ok": True}


# ── User Reports (제보) ─────────────────────────────────────
class UserReportCreate(BaseModel):
    type: str
    content: str
    link: str | None = None
    contact: str | None = None


class UserReportOut(BaseModel):
    id: uuid.UUID
    type: str
    content: str
    link: str | None
    contact: str | None
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


@router.post("/reports", response_model=UserReportOut, status_code=201)
async def create_user_report(body: UserReportCreate, db: AsyncSession = Depends(get_db)):
    report = UserReport(type=body.type, content=body.content, link=body.link, contact=body.contact)
    db.add(report)
    await db.flush()
    await db.refresh(report)
    await create_notification(db, "new_report", "info", f"새 제보: {body.content[:50]}", {"report_id": str(report.id)})
    return report


@router.get("/reports/list", response_model=list[UserReportOut])
async def list_user_reports(db: AsyncSession = Depends(get_db), _admin: User = Depends(require_admin)):
    result = await db.execute(select(UserReport).order_by(UserReport.created_at.desc()).limit(100))
    return list(result.scalars().all())


# ── Audit Logs ───────────────────────────────────────────────
class AuditLogOut(BaseModel):
    id: uuid.UUID
    admin_user_id: uuid.UUID
    action: str
    target_type: str
    target_id: str
    payload: dict | None
    created_at: datetime
    model_config = {"from_attributes": True}


@router.get("/audit-logs", response_model=list[AuditLogOut])
async def list_audit_logs(
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).limit(limit))
    return list(result.scalars().all())
