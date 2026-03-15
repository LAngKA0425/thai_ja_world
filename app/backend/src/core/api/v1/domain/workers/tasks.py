from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone

from sqlalchemy import and_, create_engine, select
from sqlalchemy.orm import Session

from src.core.api.v1.domain.workers.celery_app import celery_app
from src.core.config import settings

SYNC_URL = settings.SYNC_DATABASE_URL


def get_sync_session():
    from sqlalchemy.orm import sessionmaker
    engine = create_engine(SYNC_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


@celery_app.task
def publish_scheduled_posts() -> dict:
    from src.core.api.v1.domain.models.admin import ScheduledPost, AdminNotification
    from src.core.api.v1.domain.models.post import Post
    from src.core.api.v1.domain.models.user import User

    session = get_sync_session()
    published = 0
    failed = 0
    try:
        now = datetime.now(timezone.utc)
        rows = session.execute(
            select(ScheduledPost).where(
                and_(ScheduledPost.status == "scheduled", ScheduledPost.publish_at <= now)
            ).with_for_update(skip_locked=True)
        ).scalars().all()

        for sp in rows:
            try:
                payload = sp.post_payload
                # Use a system user ID for auto-published posts
                # Find admin user
                admin = session.execute(select(User).where(User.role == "admin")).scalars().first()
                author_id = admin.id if admin else uuid.uuid4()

                post = Post(
                    author_id=author_id,
                    type=payload.get("type", "tip"),
                    title=payload.get("title", ""),
                    body=payload.get("body", ""),
                    area=payload.get("area"),
                    tags=payload.get("tags"),
                    images=payload.get("images"),
                )
                session.add(post)
                session.flush()
                sp.status = "published"
                sp.published_post_id = post.id
                published += 1
            except Exception as e:
                sp.retry_count = (sp.retry_count or 0) + 1
                sp.error = str(e)[:500]
                if sp.retry_count >= 3:
                    sp.status = "failed"
                    notif = AdminNotification(
                        type="scheduled_failed",
                        severity="critical",
                        title=f"예약 발행 실패: {sp.post_payload.get('title', '')[:50]}",
                        payload={"scheduled_id": str(sp.id), "error": str(e)[:200]},
                    )
                    session.add(notif)
                failed += 1
        session.commit()
    except Exception:
        session.rollback()
    finally:
        session.close()

    return {"published": published, "failed": failed}


@celery_app.task
def ingest_all_sources() -> dict:
    from src.core.api.v1.domain.models.admin import IngestedSource, IngestedDraft

    session = get_sync_session()
    total = 0
    try:
        now = datetime.now(timezone.utc)
        sources = session.execute(
            select(IngestedSource).where(IngestedSource.is_enabled == True)
        ).scalars().all()

        for source in sources:
            if source.last_fetched_at:
                from datetime import timedelta
                next_fetch = source.last_fetched_at + timedelta(minutes=source.fetch_interval_minutes)
                if now < next_fetch:
                    continue

            # For now, mark as fetched (actual RSS/web fetching to be implemented)
            source.last_fetched_at = now
            total += 1

        session.commit()
    except Exception:
        session.rollback()
    finally:
        session.close()

    return {"sources_checked": total}


@celery_app.task
def example_task() -> str:
    return "ok"
