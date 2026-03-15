from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, computed_field


class PointBalanceResponse(BaseModel):
    user_id: uuid.UUID
    total_points: int
    available_points: int
    pending_points: int
    last_updated: datetime = Field(validation_alias="updated_at")

    @computed_field(return_type=int)
    @property
    def gem_balance(self) -> int:
        # Compatibility adapter for clients still using gem naming.
        return self.available_points

    model_config = {"from_attributes": True}


class PointTransactionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type: Literal["earn", "spend", "refund"]
    amount: int
    reason: str
    source_type: Literal["quest", "shop", "admin", "login", "post", "comment", "like", "report"]
    created_at: datetime

    model_config = {"from_attributes": True}


class PointTransactionListResponse(BaseModel):
    items: list[PointTransactionResponse]
    total: int


class GemBalanceResponse(BaseModel):
    gem_balance: int


class GemTransactionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type: Literal["earn", "spend", "refund"]
    amount: int
    reason: str
    source_type: str
    created_at: datetime

    model_config = {"from_attributes": True}


class GemTransactionListResponse(BaseModel):
    items: list[GemTransactionResponse]
    total: int


class AdjustPointsRequest(BaseModel):
    user_id: uuid.UUID
    amount: int = Field(..., description="Can be positive or negative")
    reason: str
    type: Literal["earn", "spend", "refund"] = "earn"


class DailyCap(BaseModel):
    daily_max_earn: int = 500
