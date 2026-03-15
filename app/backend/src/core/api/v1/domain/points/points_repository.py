from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.infra.db import Base


class PointBalance(Base):
    __tablename__ = "point_balances"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    available_points: Mapped[int] = mapped_column(Integer, default=0)
    pending_points: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class PointTransaction(Base):
    __tablename__ = "point_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # earn, spend, refund
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)  # quest, shop, admin, login, post, comment, like, report
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)


class PointsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_balance(self, user_id: uuid.UUID) -> PointBalance | None:
        result = await self.db.execute(
            select(PointBalance).where(PointBalance.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_balance_for_update(self, user_id: uuid.UUID) -> PointBalance | None:
        result = await self.db.execute(
            select(PointBalance)
            .where(PointBalance.user_id == user_id)
            .with_for_update()
        )
        return result.scalar_one_or_none()

    async def get_or_create_balance(self, user_id: uuid.UUID) -> PointBalance:
        balance = await self.get_balance_for_update(user_id)
        if balance:
            return balance
        balance = PointBalance(user_id=user_id)
        self.db.add(balance)
        await self.db.flush()
        await self.db.refresh(balance)
        return balance

    async def get_transactions(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> tuple[list[PointTransaction], int]:
        query = select(PointTransaction).where(PointTransaction.user_id == user_id)

        # Get total count
        count_result = await self.db.execute(
            select(func.count()).select_from(PointTransaction).where(PointTransaction.user_id == user_id)
        )
        total = count_result.scalar()

        # Get paginated results
        result = await self.db.execute(
            query.order_by(PointTransaction.created_at.desc()).offset(skip).limit(limit)
        )
        transactions = result.scalars().all()
        return transactions, total

    async def add_transaction(
        self,
        user_id: uuid.UUID,
        transaction_type: str,
        amount: int,
        reason: str,
        source_type: str,
    ) -> PointTransaction:
        transaction = PointTransaction(
            user_id=user_id,
            type=transaction_type,
            amount=amount,
            reason=reason,
            source_type=source_type,
        )
        self.db.add(transaction)
        await self.db.flush()
        await self.db.refresh(transaction)
        return transaction

    async def update_balance(
        self,
        user_id: uuid.UUID,
        total_points: int,
        available_points: int,
        pending_points: int,
    ) -> PointBalance:
        balance = await self.get_or_create_balance(user_id)
        balance.total_points = total_points
        balance.available_points = available_points
        balance.pending_points = pending_points
        balance.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        await self.db.refresh(balance)
        return balance
