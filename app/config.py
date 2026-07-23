import os

from dotenv import load_dotenv

load_dotenv()


def _require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


class Settings:
    def __init__(self) -> None:
        self.gemini_api_key = _require("GEMINI_API_KEY")
        self.gemini_model = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
        self.guest_password = _require("GUEST_PASSWORD")
        self.admin_password = _require("ADMIN_PASSWORD")
        self.secret_key = _require("SECRET_KEY")
        self.persona_path = os.environ.get("PERSONA_PATH", "data/persona.txt")

        self.rate_limit_max_messages = int(os.environ.get("RATE_LIMIT_MAX_MESSAGES", "60"))
        self.rate_limit_window_seconds = int(os.environ.get("RATE_LIMIT_WINDOW_SECONDS", str(60 * 60)))
        self.rate_limit_min_interval_seconds = float(os.environ.get("RATE_LIMIT_MIN_INTERVAL_SECONDS", "1.5"))


settings = Settings()
