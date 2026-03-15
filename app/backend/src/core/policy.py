from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.models.moderation import BannedKeyword
from src.core.errors import policy_violation


async def check_banned_keywords(db: AsyncSession, text: str) -> None:
    result = await db.execute(select(BannedKeyword.word))
    keywords = [row[0] for row in result.all()]
    lower_text = text.lower()
    for kw in keywords:
        if kw.lower() in lower_text:
            raise policy_violation()
