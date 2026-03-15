from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.quests.quests_repository import (
    QuestsRepository,
    QuestDefinition,
    UserQuestState,
)


class QuestsService:
    def __init__(self, db: AsyncSession):
        self.repository = QuestsRepository(db)
        self.db = db

    async def get_daily_quests(self) -> list[QuestDefinition]:
        """Get all active quests available today."""
        return await self.repository.get_all_active_quests()

    async def get_user_quest_states(
        self, user_id: uuid.UUID, quest_date: datetime | None = None
    ) -> list[UserQuestState]:
        """Get user's quest states for today (or specified date)."""
        if quest_date is None:
            quest_date = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        return await self.repository.get_user_daily_quest_states(user_id, quest_date)

    async def complete_quest(
        self,
        user_id: uuid.UUID,
        quest_id: uuid.UUID,
        quest_date: datetime | None = None,
    ) -> tuple[UserQuestState, bool]:
        """
        Complete a quest for a user.

        Returns:
            Tuple of (UserQuestState, quest_rewarded)
            - quest_rewarded: True if this completion grants the reward (first completion)

        Raises:
            ValueError: If quest not found or daily limit exceeded
        """
        if quest_date is None:
            quest_date = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        # Get quest definition
        quest = await self.repository.get_quest_by_id(quest_id)
        if not quest:
            raise ValueError(f"Quest not found: {quest_id}")

        if not quest.is_active:
            raise ValueError(f"Quest is not active: {quest_id}")

        # Get or create user quest state
        state = await self.repository.get_user_quest_state(user_id, quest_id, quest_date)

        if not state:
            # First completion for this quest today
            state = await self.repository.create_or_update_quest_state(
                user_id=user_id,
                quest_id=quest_id,
                quest_date=quest_date,
                increment_count=True,
                mark_rewarded=True,
            )
            return state, True
        else:
            # Check if already at max completions
            if state.completed_count >= quest.max_completions_per_day:
                raise ValueError(
                    f"Daily completion limit reached for quest {quest_id}. "
                    f"Max: {quest.max_completions_per_day}, Current: {state.completed_count}"
                )

            # Increment completion count, reward only once per quest
            state = await self.repository.create_or_update_quest_state(
                user_id=user_id,
                quest_id=quest_id,
                quest_date=quest_date,
                increment_count=True,
                mark_rewarded=False,
            )
            return state, False

    async def get_admin_summary(self) -> dict:
        """Get admin summary stats for quests."""
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        total_quests = await self.repository.get_quest_definition_count()
        active_quests = await self.repository.get_active_quest_count()
        completions_today = await self.repository.get_today_completions_count(today_start)
        points_awarded_today = await self.repository.get_today_points_awarded(today_start)

        return {
            "total_quests": total_quests,
            "active_quests": active_quests,
            "completions_today": completions_today,
            "points_awarded_today": points_awarded_today,
        }
