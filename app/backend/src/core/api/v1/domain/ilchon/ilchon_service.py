from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.ilchon.ilchon_repository import (
    IlchonRepository,
    IlchonRelation,
)
from src.core.api.v1.domain.models.user import User
from src.core.errors import not_found, bad_request


class IlchonService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = IlchonRepository(db)

    async def get_relations(self, user_id: uuid.UUID) -> dict:
        relations = await self.repository.get_relations_for_user(user_id)
        user_ids: set[uuid.UUID] = set()
        for r in relations:
            user_ids.add(r.requester_id)
            user_ids.add(r.receiver_id)

        nicknames: dict[uuid.UUID, str] = {}
        if user_ids:
            from sqlalchemy import select
            result = await self.db.execute(select(User).where(User.id.in_(list(user_ids))))
            for user in result.scalars().all():
                nicknames[user.id] = user.nickname

        mapped = []
        for relation in relations:
            mapped.append({
                "id": relation.id,
                "requester_id": relation.requester_id,
                "requester_nickname": nicknames.get(relation.requester_id, ""),
                "receiver_id": relation.receiver_id,
                "receiver_nickname": nicknames.get(relation.receiver_id, ""),
                "status": relation.status,
                "ilchon_comment": relation.ilchon_comment,
                "created_at": relation.created_at,
            })

        return {"relations": mapped, "total": len(mapped)}

    async def get_relation_status(self, me_id: uuid.UUID, target_user_id: uuid.UUID) -> dict:
        if me_id == target_user_id:
            return {"status": "self", "relation_id": None, "direction": None}

        relation = await self.repository.get_existing_between(me_id, target_user_id)
        if not relation:
            return {"status": "none", "relation_id": None, "direction": None}

        direction = "outgoing" if relation.requester_id == me_id else "incoming"
        return {"status": relation.status, "relation_id": relation.id, "direction": direction}

    async def send_request(
        self, requester_id: uuid.UUID, receiver_id: uuid.UUID, ilchon_comment: str | None
    ) -> IlchonRelation:
        if requester_id == receiver_id:
            raise bad_request("SELF_REQUEST", "자기 자신에게 일촌 신청을 보낼 수 없습니다")

        existing = await self.repository.get_existing_between(requester_id, receiver_id)
        if existing and existing.status in ("pending", "accepted"):
            raise bad_request("DUPLICATE_REQUEST", "이미 일촌 관계 또는 신청 내역이 있습니다")

        return await self.repository.create_request(requester_id, receiver_id, ilchon_comment)

    async def accept_request(self, relation_id: uuid.UUID, actor_id: uuid.UUID) -> IlchonRelation:
        relation = await self.repository.get_relation_for_user(relation_id, actor_id)
        if not relation:
            raise not_found("Ilchon request not found")
        if relation.receiver_id != actor_id:
            raise bad_request("NOT_RECEIVER", "요청 수락 권한이 없습니다")
        if relation.status != "pending":
            raise bad_request("INVALID_STATUS", "대기중 요청만 수락할 수 있습니다")

        relation = await self.repository.update_status(relation_id, "accepted")
        if not relation:
            raise not_found("Ilchon request not found")
        return relation

    async def reject_request(self, relation_id: uuid.UUID, actor_id: uuid.UUID) -> bool:
        relation = await self.repository.get_relation_for_user(relation_id, actor_id)
        if not relation:
            raise not_found("Ilchon request not found")
        if relation.receiver_id != actor_id:
            raise bad_request("NOT_RECEIVER", "요청 거절 권한이 없습니다")
        if relation.status != "pending":
            raise bad_request("INVALID_STATUS", "대기중 요청만 거절할 수 있습니다")

        relation = await self.repository.update_status(relation_id, "rejected")
        if not relation:
            raise not_found("Ilchon request not found")
        return True

    async def remove_ilchon(self, relation_id: uuid.UUID, actor_id: uuid.UUID) -> bool:
        relation = await self.repository.get_relation_for_user(relation_id, actor_id)
        if not relation:
            raise not_found("Ilchon relation not found")

        success = await self.repository.delete_relation(relation_id)
        if not success:
            raise not_found("Ilchon relation not found")
        return True
