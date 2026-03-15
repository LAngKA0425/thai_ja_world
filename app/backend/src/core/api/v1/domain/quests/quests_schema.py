from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class QuestDefinitionResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    quest_type: Literal[
        "daily_login",
        "write_post",
        "visit_minihome",
        "write_comment",
        "like_post",
        "guestbook_write",
        "miniroom_trash",
    ]
    reward_points: int
    max_completions_per_day: int
    is_active: bool

    model_config = {"from_attributes": True}


class UserQuestStateResponse(BaseModel):
    quest_id: uuid.UUID
    user_id: uuid.UUID
    completed_count: int
    is_rewarded: bool
    date: datetime

    model_config = {"from_attributes": True}


class QuestCompleteRequest(BaseModel):
    quest_id: uuid.UUID


class QuestAdminSummaryResponse(BaseModel):
    total_quests: int
    active_quests: int
    completions_today: int
    points_awarded_today: int
