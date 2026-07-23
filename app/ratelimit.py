import threading
import time
from collections import defaultdict, deque

from app.config import settings

_lock = threading.Lock()
_hits: dict[str, deque] = defaultdict(deque)
_last_message_at: dict[str, float] = {}


class RateLimitError(Exception):
    def __init__(self, retry_after_seconds: float):
        self.retry_after_seconds = retry_after_seconds
        super().__init__(f"Rate limit exceeded, retry after {retry_after_seconds:.1f}s")


def check_and_record(sid: str) -> None:
    now = time.monotonic()
    with _lock:
        last = _last_message_at.get(sid, 0.0)
        since_last = now - last
        if since_last < settings.rate_limit_min_interval_seconds:
            raise RateLimitError(settings.rate_limit_min_interval_seconds - since_last)

        window = _hits[sid]
        while window and now - window[0] > settings.rate_limit_window_seconds:
            window.popleft()

        if len(window) >= settings.rate_limit_max_messages:
            raise RateLimitError(settings.rate_limit_window_seconds - (now - window[0]))

        window.append(now)
        _last_message_at[sid] = now
