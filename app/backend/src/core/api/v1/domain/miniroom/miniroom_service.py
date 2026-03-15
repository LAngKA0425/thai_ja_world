from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.miniroom.miniroom_repository import (
    MiniroomRepository,
    MiniroomObject,
)
from src.core.errors import not_found, bad_request


class MiniroomService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = MiniroomRepository(db)

    async def get_room_state(self, user_id: uuid.UUID) -> dict:
        objects = await self.repository.get_objects_for_user(user_id)
        trash_quest_available = any(obj.item_type == "trash_quest" for obj in objects)
        return {
            "user_id": user_id,
            "objects": objects,
            "trash_quest_available": trash_quest_available,
        }

    async def create_object(
        self,
        user_id: uuid.UUID,
        item_type: str,
        name: str,
        image_url: str,
        position_x: int = 0,
        position_y: int = 0,
        is_interactable: bool = False,
        interaction_type: str | None = None,
    ) -> MiniroomObject:
        return await self.repository.create_object(
            user_id, item_type, name, image_url, position_x, position_y, is_interactable, interaction_type
        )

    async def interact_with_object(self, object_id: uuid.UUID, visitor_id: uuid.UUID) -> dict:
        obj = await self.repository.get_object(object_id)
        if not obj:
            raise not_found("Object not found")
        if not obj.is_interactable:
            raise bad_request("NOT_INTERACTABLE", "This object is not interactable")

        await self.repository.log_interaction(object_id, visitor_id, obj.interaction_type or "click")

        return {
            "success": True,
            "object_id": object_id,
            "interaction_type": obj.interaction_type,
        }

    async def get_trash_quest_status(self, user_id: uuid.UUID) -> dict:
        objects = await self.repository.get_objects_for_user(user_id)
        trash_quest_obj = next((obj for obj in objects if obj.item_type == "trash_quest"), None)
        return {
            "available": trash_quest_obj is not None,
            "object_id": trash_quest_obj.id if trash_quest_obj else None,
        }

    async def update_object_position(self, object_id: uuid.UUID, position_x: int, position_y: int) -> MiniroomObject:
        obj = await self.repository.update_object_position(object_id, position_x, position_y)
        if not obj:
            raise not_found("Object not found")
        return obj
