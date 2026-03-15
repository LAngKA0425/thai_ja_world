from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from src.core.api.v1.domain.infra.db import Base


class IlchonRelation(Base):
    __tablename__ = "ilchon_relations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    receiver_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    ilchon_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class IlchonRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_relations_for_user(self, user_id: uuid.UUID) -> list[IlchonRelation]:
        stmt = (
            select(IlchonRelation)
            .where(
                or_(
                    IlchonRelation.requester_id == user_id,
                    IlchonRelation.receiver_id == user_id,
                )
            )
            .order_by(IlchonRelation.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_relation(self, relation_id: uuid.UUID) -> IlchonRelation | None:
        result = await self.db.execute(
            select(IlchonRelation).where(IlchonRelation.id == relation_id)
        )
        return result.scalar_one_or_none()

    async def get_relation_for_user(self, relation_id: uuid.UUID, user_id: uuid.UUID) -> IlchonRelation | None:
        result = await self.db.execute(
            select(IlchonRelation).where(
                (IlchonRelation.id == relation_id)
                & (
                    (IlchonRelation.requester_id == user_id)
                    | (IlchonRelation.receiver_id == user_id)
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_existing_between(self, user_a: uuid.UUID, user_b: uuid.UUID) -> IlchonRelation | None:
        result = await self.db.execute(
            select(IlchonRelation)
            .where(
                ((IlchonRelation.requester_id == user_a) & (IlchonRelation.receiver_id == user_b))
                | ((IlchonRelation.requester_id == user_b) & (IlchonRelation.receiver_id == user_a))
            )
            .order_by(IlchonRelation.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def create_request(
        self, requester_id: uuid.UUID, receiver_id: uuid.UUID, ilchon_comment: str | None
    ) -> IlchonRelation:
        relation = IlchonRelation(
            requester_id=requester_id,
            receiver_id=receiver_id,
            ilchon_comment=ilchon_comment,
        )
        self.db.add(relation)
        await self.db.flush()
        await self.db.refresh(relation)
        return relation

    async def update_status(self, relation_id: uuid.UUID, status: str) -> IlchonRelation | None:
        relation = await self.get_relation(relation_id)
        if not relation:
            return None
        relation.status = status
        await self.db.flush()
        return relation

    async def delete_relation(self, relation_id: uuid.UUID) -> bool:
        relation = await self.get_relation(relation_id)
        if not relation:
            return False
        await self.db.delete(relation)
        await self.db.flush()
        return True
