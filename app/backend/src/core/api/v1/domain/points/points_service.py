from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.points.points_repository import (
    PointsRepository,
    PointBalance,
    PointTransaction,
)
from src.core.api.v1.domain.models.user import User


DAILY_MAX_EARN = 500


class PointsService:
    def __init__(self, db: AsyncSession):
        self.repository = PointsRepository(db)
        self.db = db

    async def get_user_balance(self, user_id: uuid.UUID) -> PointBalance:
        balance = await self.repository.get_balance(user_id)
        if not balance:
            balance = await self.repository.get_or_create_balance(user_id)
            user_result = await self.db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()
            if user:
                user.gem_balance = balance.available_points
        return balance

    async def get_user_history(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> tuple[list[PointTransaction], int]:
        return await self.repository.get_transactions(user_id, skip, limit)

    async def _get_daily_earned(self, user_id: uuid.UUID) -> int:
        """Get total points earned today by this user"""
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        result = await self.db.execute(
            select(func.sum(PointTransaction.amount))
            .where(
                (PointTransaction.user_id == user_id)
                & (PointTransaction.type == "earn")
                & (PointTransaction.created_at >= today_start)
            )
        )
        daily_earned = result.scalar() or 0
        return daily_earned

    async def _check_source_type_duplicate(
        self, user_id: uuid.UUID, source_type: str, hours: int = 24
    ) -> bool:
        """Check if user has earned points from the same source type within the last N hours"""
        time_threshold = datetime.now(timezone.utc) - timedelta(hours=hours)

        result = await self.db.execute(
            select(PointTransaction)
            .where(
                (PointTransaction.user_id == user_id)
                & (PointTransaction.source_type == source_type)
                & (PointTransaction.type == "earn")
                & (PointTransaction.created_at >= time_threshold)
            )
            .limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def earn_points(
        self,
        user_id: uuid.UUID,
        amount: int,
        reason: str,
        source_type: str,
        check_daily_cap: bool = True,
        check_source_duplicate: bool = True,
    ) -> PointTransaction:
        """
        Earn points for a user with daily cap and source type duplicate prevention.

        Args:
            user_id: User ID
            amount: Points to earn
            reason: Reason for earning
            source_type: Source of earning (quest, shop, etc)
            check_daily_cap: Whether to check daily earning cap (max 500 per day)
            check_source_duplicate: Whether to prevent earning from same source type within 24h

        Returns:
            PointTransaction

        Raises:
            ValueError: If daily cap exceeded or duplicate source attempt
        """
        # Check daily cap
        if check_daily_cap:
            daily_earned = await self._get_daily_earned(user_id)
            if daily_earned + amount > DAILY_MAX_EARN:
                raise ValueError(
                    f"Daily earning cap exceeded. Current: {daily_earned}, Limit: {DAILY_MAX_EARN}"
                )

        # Check for duplicate source type (anti-abuse)
        if check_source_duplicate:
            has_duplicate = await self._check_source_type_duplicate(user_id, source_type)
            if has_duplicate:
                raise ValueError(f"Cannot earn from same source type twice within 24 hours: {source_type}")

        # Create transaction
        transaction = await self.repository.add_transaction(
            user_id=user_id,
            transaction_type="earn",
            amount=amount,
            reason=reason,
            source_type=source_type,
        )

        # Update balance
        balance = await self.repository.get_or_create_balance(user_id)
        new_total = balance.total_points + amount
        new_available = balance.available_points + amount
        await self.repository.update_balance(
            user_id,
            total_points=new_total,
            available_points=new_available,
            pending_points=balance.pending_points,
        )

        user_result = await self.db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if user:
            user.gem_balance = new_available

        return transaction

    async def spend_points(
        self, user_id: uuid.UUID, amount: int, reason: str, source_type: str = "shop"
    ) -> PointTransaction:
        """
        Spend points for a user (e.g., purchasing from shop).

        Args:
            user_id: User ID
            amount: Points to spend
            reason: Reason for spending
            source_type: Source of spending (default: shop)

        Returns:
            PointTransaction

        Raises:
            ValueError: If insufficient available points
        """
        balance = await self.repository.get_balance_for_update(user_id)
        if not balance or balance.available_points < amount:
            raise ValueError("Insufficient available points")

        # Create transaction
        transaction = await self.repository.add_transaction(
            user_id=user_id,
            transaction_type="spend",
            amount=amount,
            reason=reason,
            source_type=source_type,
        )

        # Update balance
        new_total = balance.total_points - amount
        new_available = balance.available_points - amount
        await self.repository.update_balance(
            user_id,
            total_points=new_total,
            available_points=new_available,
            pending_points=balance.pending_points,
        )

        user_result = await self.db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if user:
            user.gem_balance = new_available

        return transaction

    async def admin_adjust_points(
        self,
        user_id: uuid.UUID,
        amount: int,
        reason: str,
        adjustment_type: str = "earn",
    ) -> PointTransaction:
        """
        Admin adjustment of user points (no daily cap or source checks).

        Args:
            user_id: User ID
            amount: Points to add/subtract (can be negative)
            reason: Reason for adjustment
            adjustment_type: Type of adjustment (earn, spend, refund)

        Returns:
            PointTransaction
        """
        # Create transaction
        transaction = await self.repository.add_transaction(
            user_id=user_id,
            transaction_type=adjustment_type,
            amount=amount,
            reason=reason,
            source_type="admin",
        )

        # Update balance
        balance = await self.repository.get_or_create_balance(user_id)
        new_total = balance.total_points + amount
        new_available = balance.available_points + amount if adjustment_type == "earn" else balance.available_points - abs(amount)
        await self.repository.update_balance(
            user_id,
            total_points=max(0, new_total),
            available_points=max(0, new_available),
            pending_points=balance.pending_points,
        )

        user_result = await self.db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if user:
            user.gem_balance = max(0, new_available)

        return transaction
