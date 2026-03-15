from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user, require_admin
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.quests.quests_schema import (
    QuestDefinitionResponse,
    UserQuestStateResponse,
    QuestCompleteRequest,
    QuestAdminSummaryResponse,
)
from src.core.api.v1.domain.quests.quests_service import QuestsService
from src.core.api.v1.domain.points.points_service import PointsService
from src.core.errors import bad_request

router = APIRouter(prefix="/quests", tags=["quests"])


@router.get("/daily", response_model=list[QuestDefinitionResponse])
async def get_daily_quests(
    db: AsyncSession = Depends(get_db),
):
    """Get today's available quests."""
    service = QuestsService(db)
    quests = await service.get_daily_quests()
    return [QuestDefinitionResponse.model_validate(q) for q in quests]


@router.get("/my-state", response_model=list[UserQuestStateResponse])
async def get_my_quest_states(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's quest states for today."""
    service = QuestsService(db)
    states = await service.get_user_quest_states(current_user.id)
    return [UserQuestStateResponse.model_validate(s) for s in states]


@router.post("/complete", response_model=UserQuestStateResponse)
async def complete_quest(
    body: QuestCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Complete a quest.

    This endpoint:
    1. Validates the quest exists and is active
    2. Checks daily completion limit
    3. Awards points on first completion (prevents duplicate rewards)
    4. Updates user's quest state
    """
    quest_service = QuestsService(db)
    points_service = PointsService(db)

    try:
        state, quest_rewarded = await quest_service.complete_quest(
            user_id=current_user.id,
            quest_id=body.quest_id,
        )
    except ValueError as e:
        raise bad_request("QUEST_ERROR", str(e))

    # Award points only on first completion
    if quest_rewarded:
        # Get quest definition to get reward amount
        from src.core.api.v1.domain.quests.quests_repository import QuestsRepository
        repo = QuestsRepository(db)
        quest = await repo.get_quest_by_id(body.quest_id)

        if quest:
            try:
                await points_service.earn_points(
                    user_id=current_user.id,
                    amount=quest.reward_points,
                    reason=f"Quest reward: {quest.title}",
                    source_type="quest",
                    check_daily_cap=True,
                    check_source_duplicate=False,  # Different quests can be completed same day
                )
            except ValueError as e:
                raise bad_request("POINTS_ERROR", str(e))

    await db.commit()
    return UserQuestStateResponse.model_validate(state)


@router.get("/admin/summary", response_model=QuestAdminSummaryResponse)
async def admin_quest_summary(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin endpoint to get quest system summary stats."""
    service = QuestsService(db)
    summary = await service.get_admin_summary()
    return QuestAdminSummaryResponse(**summary)
