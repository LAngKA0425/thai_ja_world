from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.api.v1.domain.infra.db import Base


class ReservationShop(Base):
    __tablename__ = "reservation_shops"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ReservationSlot(Base):
    __tablename__ = "reservation_slots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shop_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("reservation_shops.id"), nullable=False, index=True)
    available_count: Mapped[int] = mapped_column(Integer, nullable=False)
    reserved_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    slot_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    shop_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("reservation_shops.id"), nullable=False)
    slot_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("reservation_slots.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="confirmed")  # confirmed, canceled, completed
    reserved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    total_price: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ReservationPointUsage(Base):
    __tablename__ = "reservation_point_usage"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reservation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("reservations.id"), nullable=False)
    points_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    discount_amount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ReservationsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_shops(self, active_only: bool = True) -> list[ReservationShop]:
        stmt = select(ReservationShop).order_by(ReservationShop.created_at.desc())
        if active_only:
            stmt = stmt.where(ReservationShop.is_active == True)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_shop(self, shop_id: uuid.UUID) -> ReservationShop | None:
        result = await self.db.execute(select(ReservationShop).where(ReservationShop.id == shop_id))
        return result.scalar_one_or_none()

    async def get_slots_for_shop(self, shop_id: uuid.UUID, active_only: bool = True) -> list[ReservationSlot]:
        stmt = select(ReservationSlot).where(ReservationSlot.shop_id == shop_id).order_by(ReservationSlot.slot_time)
        if active_only:
            stmt = stmt.where(ReservationSlot.is_active == True)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_slot(self, slot_id: uuid.UUID) -> ReservationSlot | None:
        result = await self.db.execute(select(ReservationSlot).where(ReservationSlot.id == slot_id))
        return result.scalar_one_or_none()

    async def create_reservation(
        self,
        user_id: uuid.UUID,
        shop_id: uuid.UUID,
        slot_id: uuid.UUID,
        total_price: int,
    ) -> Reservation:
        reservation = Reservation(user_id=user_id, shop_id=shop_id, slot_id=slot_id, total_price=total_price)
        self.db.add(reservation)
        await self.db.flush()
        await self.db.refresh(reservation)
        return reservation

    async def create_point_usage(
        self,
        reservation_id: uuid.UUID,
        points_used: int,
        discount_amount: int,
    ) -> ReservationPointUsage:
        usage = ReservationPointUsage(reservation_id=reservation_id, points_used=points_used, discount_amount=discount_amount)
        self.db.add(usage)
        await self.db.flush()
        await self.db.refresh(usage)
        return usage

    async def get_user_reservations(self, user_id: uuid.UUID, limit: int = 50, offset: int = 0) -> list[Reservation]:
        result = await self.db.execute(
            select(Reservation)
            .where(Reservation.user_id == user_id)
            .order_by(Reservation.reserved_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def get_reservation(self, reservation_id: uuid.UUID) -> Reservation | None:
        result = await self.db.execute(select(Reservation).where(Reservation.id == reservation_id))
        return result.scalar_one_or_none()

    async def get_point_usage(self, reservation_id: uuid.UUID) -> ReservationPointUsage | None:
        result = await self.db.execute(
            select(ReservationPointUsage).where(ReservationPointUsage.reservation_id == reservation_id)
        )
        return result.scalar_one_or_none()

    async def update_slot_reserved_count(self, slot_id: uuid.UUID, increment: int = 1) -> ReservationSlot | None:
        result = await self.db.execute(select(ReservationSlot).where(ReservationSlot.id == slot_id))
        slot = result.scalar_one_or_none()
        if not slot:
            return None
        slot.reserved_count += increment
        await self.db.flush()
        await self.db.refresh(slot)
        return slot
