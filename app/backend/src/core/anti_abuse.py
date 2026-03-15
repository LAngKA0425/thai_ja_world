from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class SignupContext:
    email: str
    nickname: str
    phone: str | None
    ip: str | None
    user_agent: str | None
    device_hash: str | None
    captcha_token: str | None


@dataclass
class SignupDecision:
    allow: bool = True
    risk_level: str = "low"
    risk_score: int = 0
    suspicious: bool = False
    admin_review_required: bool = False
    blocked_until: datetime | None = None
    reason: str | None = None
    verification_required: bool = False


@dataclass
class LoginContext:
    email: str
    ip: str | None
    user_agent: str | None
    device_hash: str | None
    captcha_token: str | None


@dataclass
class LoginDecision:
    allow: bool = True
    risk_level: str = "low"
    risk_score: int = 0
    suspicious: bool = False
    admin_review_required: bool = False
    blocked_until: datetime | None = None
    reason: str | None = None


async def evaluate_signup(context: SignupContext) -> SignupDecision:
    """
    Anti-abuse hook for signup.
    Extend here with:
    - captcha/turnstile verification
    - email/phone verification workflows
    - passkey/WebAuthn enrollment pre-checks
    - IP/device fingerprint risk scoring
    - velocity checks and allow/deny lists
    """
    _ = context
    return SignupDecision()


async def evaluate_login(context: LoginContext) -> LoginDecision:
    """
    Anti-abuse hook for login.
    Extend here with:
    - captcha challenges on suspicious logins
    - IP/device reputation checks
    - risk scoring + temporary blocks
    """
    _ = context
    return LoginDecision()
