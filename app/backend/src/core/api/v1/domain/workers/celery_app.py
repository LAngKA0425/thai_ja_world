from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from src.core.config import settings

celery_app = Celery("taeja", broker=settings.REDIS_URL, backend=settings.REDIS_URL)
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["json"]
celery_app.conf.timezone = "Asia/Bangkok"

celery_app.conf.beat_schedule = {
    "publish-scheduled-posts": {
        "task": "src.core.api.v1.domain.workers.tasks.publish_scheduled_posts",
        "schedule": 60.0,
    },
    "ingest-sources": {
        "task": "src.core.api.v1.domain.workers.tasks.ingest_all_sources",
        "schedule": crontab(minute="*/30"),
    },
}
