from __future__ import annotations

from fastapi import HTTPException, status


class AppError(HTTPException):
    def __init__(self, status_code: int, error_code: str, message: str):
        super().__init__(status_code=status_code, detail={"error_code": error_code, "message": message})


def not_found(msg: str = "요청한 리소스를 찾을 수 없습니다") -> AppError:
    return AppError(status.HTTP_404_NOT_FOUND, "NOT_FOUND", msg)


def forbidden(msg: str = "권한이 없습니다") -> AppError:
    return AppError(status.HTTP_403_FORBIDDEN, "FORBIDDEN", msg)


def bad_request(error_code: str, msg: str) -> AppError:
    return AppError(status.HTTP_400_BAD_REQUEST, error_code, msg)


def unauthorized(msg: str = "인증이 필요합니다") -> AppError:
    return AppError(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED", msg)


def policy_violation() -> AppError:
    return AppError(
        status.HTTP_400_BAD_REQUEST,
        "POLICY_VIOLATION",
        "정책에 위반되는 내용이 포함되어 있어 게시할 수 없습니다",
    )
