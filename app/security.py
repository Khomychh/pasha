import uuid

import itsdangerous

from app.config import settings

GUEST_COOKIE = "pasha_session"
ADMIN_COOKIE = "pasha_admin_session"
MAX_AGE_SECONDS = 60 * 60 * 24 * 30  # 30 days

_guest_signer = itsdangerous.URLSafeTimedSerializer(settings.secret_key, salt="guest-session")
_admin_signer = itsdangerous.URLSafeTimedSerializer(settings.secret_key, salt="admin-session")


def create_guest_cookie() -> str:
    return _guest_signer.dumps({"sid": uuid.uuid4().hex})


def read_guest_sid(cookie_value: str | None) -> str | None:
    if not cookie_value:
        return None
    try:
        data = _guest_signer.loads(cookie_value, max_age=MAX_AGE_SECONDS)
    except itsdangerous.BadData:
        return None
    return data.get("sid")


def create_admin_cookie() -> str:
    return _admin_signer.dumps({"sid": uuid.uuid4().hex})


def read_admin_sid(cookie_value: str | None) -> str | None:
    if not cookie_value:
        return None
    try:
        data = _admin_signer.loads(cookie_value, max_age=MAX_AGE_SECONDS)
    except itsdangerous.BadData:
        return None
    return data.get("sid")
