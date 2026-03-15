from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.api.v1.deps import get_current_user, require_admin
from src.core.api.v1.domain.infra.db import get_db
from src.core.api.v1.domain.models.user import User
from src.core.api.v1.domain.points.points_schema import (
    PointBalanceResponse,
    PointTransactionResponse,
    PointTransactionListResponse,
    AdjustPointsRequest,
    GemBalanceResponse,
    GemTransactionListResponse,
    GemTransactionResponse,
)
from src.core.api.v1.domain.points.points_service import PointsService
from src.core.errors import not_found

router = APIRouter(prefix="/points", tags=["points"])


@router.get("/balance", response_model=PointBalanceResponse)
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's point balance."""
    service = PointsService(db)
    balance = await service.get_user_balance(current_user.id)
    return balance


@router.get("/history", response_model=PointTransactionListResponse)
async def get_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's point transaction history with pagination."""
    service = PointsService(db)
    transactions, total = await service.get_user_history(current_user.id, skip, limit)
    return PointTransactionListResponse(
        items=[PointTransactionResponse.model_validate(t) for t in transactions],
        total=total,
    )


@router.get("/gems/balance", response_model=GemBalanceResponse)
async def get_gem_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PointsService(db)
    balance = await service.get_user_balance(current_user.id)
    return GemBalanceResponse(gem_balance=balance.available_points)


@router.get("/gems/history", response_model=GemTransactionListResponse)
async def get_gem_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PointsService(db)
    transactions, total = await service.get_user_history(current_user.id, skip, limit)
    return GemTransactionListResponse(
        items=[GemTransactionResponse.model_validate(t) for t in transactions],
        total=total,
    )


@router.post("/earn", response_model=PointTransactionResponse)
async def earn_points(
    amount: int,
    reason: str,
    source_type: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Internal endpoint to earn points (will be called by quest system, login system, etc).

    This endpoint enforces:
    - Daily earning cap (max 500 TP per day)
    - Anti-abuse: prevents earning from same source type twice within 24 hours
    """
    service = PointsService(db)
    try:
        transaction = await service.earn_points(
            user_id=current_user.id,
            amount=amount,
            reason=reason,
            source_type=source_type,
            check_daily_cap=True,
            check_source_duplicate=True,
        )
    except ValueError as e:
        raise not_found(str(e))

    await db.commit()
    return PointTransactionResponse.model_validate(transaction)


@router.post("/admin/adjust", response_model=PointTransactionResponse)
async def admin_adjust_points(
    body: AdjustPointsRequest,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin endpoint to adjust user points (bypasses daily cap and source checks)."""
    service = PointsService(db)
    transaction = await service.admin_adjust_points(
        user_id=body.user_id,
        amount=body.amount,
        reason=body.reason,
        adjustment_type=body.type,
    )
    await db.commit()
    return PointTransactionResponse.model_validate(transaction)


class PointsSummaryResponse:
    pass


@router.get("/admin/summary")
async def admin_summary(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin endpoint to get point system summary stats."""
    from sqlalchemy import select, func
    from src.core.api.v1.domain.points.points_repository import PointBalance, PointTransaction
    from datetime import datetime, timezone

    # Get total points distributed
    total_points_result = await db.execute(
        select(func.sum(PointBalance.total_points))
    )
    total_points_distributed = total_points_result.scalar() or 0

    # Get points earned today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_earned_result = await db.execute(
        select(func.sum(PointTransaction.amount)).where(
            (PointTransaction.type == "earn")
            & (PointTransaction.created_at >= today_start)
        )
    )
    points_earned_today = today_earned_result.scalar() or 0

    # Get transaction count
    transaction_count_result = await db.execute(
        select(func.count(PointTransaction.id))
    )
    transaction_count = transaction_count_result.scalar() or 0

    # Get user count with points
    user_count_result = await db.execute(
        select(func.count(PointBalance.user_id))
    )
    user_count = user_count_result.scalar() or 0

    return {
        "total_points_distributed": total_points_distributed,
        "points_earned_today": points_earned_today,
        "transaction_count": transaction_count,
        "users_with_points": user_count,
    }
