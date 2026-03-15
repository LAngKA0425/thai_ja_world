from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.domain.reservations.reservations_repository import (
    ReservationsRepository,
    ReservationShop,
    ReservationSlot,
    Reservation,
)
from src.core.errors import not_found, bad_request


class ReservationsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = ReservationsRepository(db)

    async def get_shops(self, active_only: bool = True) -> list[ReservationShop]:
        return await self.repository.get_shops(active_only)

    async def get_slots(self, shop_id: uuid.UUID, active_only: bool = True) -> list[ReservationSlot]:
        shop = await self.repository.get_shop(shop_id)
        if not shop:
            raise not_found("Shop not found")
        return await self.repository.get_slots_for_shop(shop_id, active_only)

    async def create_reservation(
        self,
        user_id: uuid.UUID,
        shop_id: uuid.UUID,
        slot_id: uuid.UUID,
        use_points: bool = False,
        points_to_use: int = 0,
        user_points: int = 0,
    ) -> dict:
        shop = await self.repository.get_shop(shop_id)
        if not shop:
            raise not_found("Shop not found")

        slot = await self.repository.get_slot(slot_id)
        if not slot:
            raise not_found("Slot not found")
        if slot.shop_id != shop_id:
            raise bad_request("INVALID_SLOT", "Slot does not belong to this shop")

        if slot.reserved_count >= slot.available_count:
            raise bad_request("SLOT_FULL", "This slot is fully booked")

        total_price = slot.price
        discount_amount = 0
        points_used = 0

        if use_points and points_to_use > 0:
            discount_info = self.calculate_point_discount(user_points, slot.price)
            if points_to_use > discount_info["eligible_points"]:
                raise bad_request("INSUFFICIENT_POINTS", "Not enough points for the requested discount")

            max_discount = discount_info["max_discount_amount"]
            discount_amount = min(points_to_use, max_discount)
            points_used = discount_amount
            total_price = max(0, slot.price - discount_amount)

        reservation = await self.repository.create_reservation(user_id, shop_id, slot_id, total_price)

        if use_points and points_used > 0:
            await self.repository.create_point_usage(reservation.id, points_used, discount_amount)

        await self.repository.update_slot_reserved_count(slot_id, 1)

        return {
            "reservation": reservation,
            "points_used": points_used,
            "discount_amount": discount_amount,
        }

    async def get_user_reservations(self, user_id: uuid.UUID, limit: int = 50, offset: int = 0) -> list[Reservation]:
        return await self.repository.get_user_reservations(user_id, limit, offset)

    def calculate_point_discount(self, user_points: int, price: int) -> dict:
        max_discount_percent = 10
        max_discount_amount = int(price * (max_discount_percent / 100))
        eligible_points = min(user_points, max_discount_amount)

        return {
            "eligible_points": eligible_points,
            "max_discount_percent": max_discount_percent,
            "max_discount_amount": max_discount_amount,
        }
