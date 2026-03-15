from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class ReservationShopResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    location: str
    image_url: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReservationSlotResponse(BaseModel):
    id: uuid.UUID
    shop_id: uuid.UUID
    available_count: int
    reserved_count: int
    slot_time: datetime
    price: int

    model_config = {"from_attributes": True}


class PointDiscountInfo(BaseModel):
    eligible_points: int
    max_discount_percent: int = 10
    discount_amount: int


class ReservationCreateRequest(BaseModel):
    shop_id: uuid.UUID
    slot_id: uuid.UUID
    use_points: bool = False
    points_to_use: int = 0


class ReservationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    shop_id: uuid.UUID
    slot_id: uuid.UUID
    status: str  # confirmed, canceled, completed
    reserved_at: datetime
    total_price: int
    points_used: int = 0
    discount_amount: int = 0

    model_config = {"from_attributes": True}
