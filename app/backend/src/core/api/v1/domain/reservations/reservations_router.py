from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.reservations.reservations_schema import (
    ReservationShopResponse,
    ReservationSlotResponse,
    ReservationCreateRequest,
    ReservationResponse,
    PointDiscountInfo,
)
from src.core.api.v1.domain.reservations.reservations_service import ReservationsService
from src.core.api.v1.domain.points.points_service import PointsService as _PointsService

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.get("/shops", response_model=list[ReservationShopResponse])
async def get_shops(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    service = ReservationsService(db)
    return await service.get_shops(active_only)


@router.get("/shops/{shop_id}/slots", response_model=list[ReservationSlotResponse])
async def get_shop_slots(
    shop_id: uuid.UUID,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    service = ReservationsService(db)
    return await service.get_slots(shop_id, active_only)


@router.post("/", response_model=ReservationResponse, status_code=201)
async def create_reservation(
    body: ReservationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReservationsService(db)
    _pts = _PointsService(db)
    _bal = await _pts.get_user_balance(current_user.id)
    user_points = _bal.available_points if _bal else 0
    result = await service.create_reservation(
        current_user.id,
        body.shop_id,
        body.slot_id,
        body.use_points,
        body.points_to_use,
        user_points,
    )
    reservation = result["reservation"]
    return ReservationResponse(
        id=reservation.id,
        user_id=reservation.user_id,
        shop_id=reservation.shop_id,
        slot_id=reservation.slot_id,
        status=reservation.status,
        reserved_at=reservation.reserved_at,
        total_price=reservation.total_price,
        points_used=result["points_used"],
        discount_amount=result["discount_amount"],
    )


@router.get("/my", response_model=list[ReservationResponse])
async def get_my_reservations(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReservationsService(db)
    reservations = await service.get_user_reservations(current_user.id, limit, offset)
    result = []
    for reservation in reservations:
        point_usage = await service.repository.get_point_usage(reservation.id)
        points_used = point_usage.points_used if point_usage else 0
        discount_amount = point_usage.discount_amount if point_usage else 0
        result.append(
            ReservationResponse(
                id=reservation.id,
                user_id=reservation.user_id,
                shop_id=reservation.shop_id,
                slot_id=reservation.slot_id,
                status=reservation.status,
                reserved_at=reservation.reserved_at,
                total_price=reservation.total_price,
                points_used=points_used,
                discount_amount=discount_amount,
            )
        )
    return result


@router.get("/point-discount-info", response_model=PointDiscountInfo)
async def get_point_discount_info(
    price: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReservationsService(db)
    _pts = _PointsService(db)
    _bal = await _pts.get_user_balance(current_user.id)
    user_points = _bal.available_points if _bal else 0
    discount_info = service.calculate_point_discount(user_points, price)
    return PointDiscountInfo(
        eligible_points=discount_info["eligible_points"],
        max_discount_percent=discount_info["max_discount_percent"],
        discount_amount=discount_info["max_discount_amount"],
    )
