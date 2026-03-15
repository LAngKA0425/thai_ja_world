from __future__ import annotations

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

from src.core.api.v1.domain.infra.redis import redis_client


# 경로별 rate limit 정책 (requests, window_seconds)
RATE_LIMIT_RULES: dict[str, tuple[int, int]] = {
    "/api/v1/auth/register": (5, 60),       # 5 req / 60s
    "/api/v1/auth/login": (10, 60),          # 10 req / 60s
    "/api/v1/auth/refresh": (20, 60),        # 20 req / 60s
    "/api/v1/guestbook/write": (10, 60),     # 10 req / 60s
}

# prefix 매칭 정책
RATE_LIMIT_PREFIX_RULES: list[tuple[str, int, int]] = [
    ("/api/v1/minihome/", 60, 60),           # 60 req / 60s
    ("/api/v1/posts", 30, 60),               # 30 req / 60s
]

# 글로벌 기본 limit (IP당)
GLOBAL_RATE_LIMIT = (200, 60)  # 200 req / 60s

# 회원가입 IP 기준 24시간 최대 계정 수 제한
REGISTER_ACCOUNT_LIMIT = 3  # 3 accounts / 24h
REGISTER_ACCOUNT_WINDOW = 86400  # 24h in seconds


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _find_rule(path: str) -> tuple[int, int]:
    # 정확 매칭 우선
    if path in RATE_LIMIT_RULES:
        return RATE_LIMIT_RULES[path]
    # prefix 매칭
    for prefix, limit, window in RATE_LIMIT_PREFIX_RULES:
        if path.startswith(prefix):
            return (limit, window)
    return GLOBAL_RATE_LIMIT


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        method = request.method

        # GET 요청은 rate limit 완화 (POST/PUT/DELETE만 엄격)
        if method == "GET":
            return await call_next(request)

        ip = _get_client_ip(request)
        limit, window = _find_rule(path)
        key = f"rate:{ip}:{path}"

        try:
            current = await redis_client.incr(key)
            if current == 1:
                await redis_client.expire(key, window)
            if current > limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={"error_code": "RATE_LIMITED", "message": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."},
                )

            # 회원가입 IP 기준 24시간 최대 계정 수 제한
            if path == "/api/v1/auth/register" and method == "POST":
                reg_key = f"register_account:{ip}"
                reg_count = await redis_client.incr(reg_key)
                if reg_count == 1:
                    await redis_client.expire(reg_key, REGISTER_ACCOUNT_WINDOW)
                if reg_count > REGISTER_ACCOUNT_LIMIT:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail={"error_code": "REGISTER_LIMIT", "message": "24시간 내 최대 계정 생성 수를 초과했습니다."},
                    )
        except HTTPException:
            raise
        except Exception:
            # Redis 연결 실패 시 rate limit 우회 (서비스 중단 방지)
            pass

        return await call_next(request)
