from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.infra.db import Base


class QuestDefinition(Base):
    __tablename__ = "quest_definitions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    quest_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    reward_points: Mapped[int] = mapped_column(Integer, nullable=False)
    max_completions_per_day: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserQuestState(Base):
    __tablename__ = "user_quest_states"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quest_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quest_definitions.id"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    completed_count: Mapped[int] = mapped_column(Integer, default=0)
    is_rewarded: Mapped[bool] = mapped_column(Boolean, default=False)
    quest_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class QuestsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_active_quests(self) -> list[QuestDefinition]:
        result = await self.db.execute(
            select(QuestDefinition).where(QuestDefinition.is_active == True).order_by(QuestDefinition.created_at)
        )
        return result.scalars().all()

    async def get_quest_by_id(self, quest_id: uuid.UUID) -> QuestDefinition | None:
        result = await self.db.execute(
            select(QuestDefinition).where(QuestDefinition.id == quest_id)
        )
        return result.scalar_one_or_none()

    async def get_user_quest_state(
        self, user_id: uuid.UUID, quest_id: uuid.UUID, quest_date: datetime
    ) -> UserQuestState | None:
        result = await self.db.execute(
            select(UserQuestState).where(
                (UserQuestState.user_id == user_id)
                & (UserQuestState.quest_id == quest_id)
                & (UserQuestState.quest_date == quest_date)
            )
        )
        return result.scalar_one_or_none()

    async def get_user_daily_quest_states(
        self, user_id: uuid.UUID, quest_date: datetime
    ) -> list[UserQuestState]:
        result = await self.db.execute(
            select(UserQuestState).where(
                (UserQuestState.user_id == user_id)
                & (UserQuestState.quest_date == quest_date)
            )
        )
        return result.scalars().all()

    async def create_or_update_quest_state(
        self,
        user_id: uuid.UUID,
        quest_id: uuid.UUID,
        quest_date: datetime,
        increment_count: bool = True,
        mark_rewarded: bool = False,
    ) -> UserQuestState:
        state = await self.get_user_quest_state(user_id, quest_id, quest_date)

        if not state:
            state = UserQuestState(
                user_id=user_id,
                quest_id=quest_id,
                quest_date=quest_date,
                completed_count=1 if increment_count else 0,
                is_rewarded=mark_rewarded,
            )
            self.db.add(state)
        else:
            if increment_count:
                state.completed_count += 1
            if mark_rewarded:
                state.is_rewarded = True
            state.updated_at = datetime.now(timezone.utc)

        await self.db.flush()
        await self.db.refresh(state)
        return state

    async def get_quest_definition_count(self) -> int:
        result = await self.db.execute(select(func.count(QuestDefinition.id)))
        return result.scalar() or 0

    async def get_active_quest_count(self) -> int:
        result = await self.db.execute(
            select(func.count(QuestDefinition.id)).where(QuestDefinition.is_active == True)
        )
        return result.scalar() or 0

    async def get_today_completions_count(self, today_start: datetime) -> int:
        result = await self.db.execute(
            select(func.count(UserQuestState.id)).where(
                UserQuestState.quest_date >= today_start
            )
        )
        return result.scalar() or 0

    async def get_today_points_awarded(self, today_start: datetime) -> int:
        result = await self.db.execute(
            select(func.sum(QuestDefinition.reward_points)).select_from(UserQuestState)
            .join(QuestDefinition, UserQuestState.quest_id == QuestDefinition.id)
            .where(
                (UserQuestState.quest_date >= today_start)
                & (UserQuestState.is_rewarded == True)
            )
        )
        return result.scalar() or 0
