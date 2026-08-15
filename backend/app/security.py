import time
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import get_settings

ALGORITHM = "HS256"

_bearer = HTTPBearer(auto_error=False)
_bearer_optional = HTTPBearer(auto_error=False)


def verify_password(password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        # A malformed hash in .env should read as "wrong password", not a 500.
        return False


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def create_access_token() -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "admin",
        "iat": now,
        "exp": now + timedelta(hours=settings.token_ttl_hours),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def _decode(token: str) -> dict | None:
    try:
        return jwt.decode(token, get_settings().secret_key, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None


def require_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """Gate for every write endpoint. Raises 401 unless the bearer token is ours."""
    claims = _decode(creds.credentials) if creds else None
    if not claims or claims.get("sub") != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not signed in at the desk",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return "admin"


def is_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer_optional),
) -> bool:
    """Soft check for read endpoints that show more to a signed-in admin."""
    claims = _decode(creds.credentials) if creds else None
    return bool(claims and claims.get("sub") == "admin")


class LoginThrottle:
    """Crude in-process brute-force brake.

    A single-author blog does not warrant Redis; this just makes an online
    password guess unaffordable. Counters reset when the process restarts.
    """

    def __init__(self, limit: int = 8, window_seconds: int = 300) -> None:
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, list[float]] = {}

    def _recent(self, key: str) -> list[float]:
        cutoff = time.monotonic() - self.window
        hits = [t for t in self._hits.get(key, []) if t > cutoff]
        self._hits[key] = hits
        return hits

    def check(self, key: str) -> None:
        if len(self._recent(key)) >= self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Wait a few minutes.",
            )

    def record_failure(self, key: str) -> None:
        self._recent(key).append(time.monotonic())

    def clear(self, key: str) -> None:
        self._hits.pop(key, None)


login_throttle = LoginThrottle()
