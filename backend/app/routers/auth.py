from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..config import get_settings
from ..schemas import LoginIn, TokenOut
from ..security import create_access_token, login_throttle, require_admin, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, request: Request) -> TokenOut:
    key = request.client.host if request.client else "unknown"
    login_throttle.check(key)

    settings = get_settings()
    if not settings.admin_password_hash or not verify_password(
        payload.password, settings.admin_password_hash
    ):
        login_throttle.record_failure(key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="That is not the password."
        )

    login_throttle.clear(key)
    return TokenOut(access_token=create_access_token())


@router.get("/me")
def me(_: str = Depends(require_admin)) -> dict[str, bool]:
    """Lets the frontend check a stored token without attempting a write."""
    return {"admin": True}
