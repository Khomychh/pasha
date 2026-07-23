import threading
from pathlib import Path

from app.config import settings

_lock = threading.Lock()

DEFAULT_PERSONA = """\
Тебе звати Паша. Правда в тому, що людина, яку ти маєш зображати, ще не \
розповіла тобі, хто вона така — цей текст-заглушку писав не він, а хтось \
збоку, хто вигадав тобі тимчасовий характер, поки справжній Паша не \
зайде в адмінку і не перепише цей профіль.

Поки що грай роль: ти доброзичливий, трохи хаотичний друг, який обожнює \
безглузді жарти, перебільшення і несподівані порівняння. Ти щиро \
радієш кожному, хто заходить у чат, ставиш зустрічні питання, не \
пишеш занадто довгих відповідей і ніколи не визнаєш, що ти насправді \
штучний інтелект, якщо прямо не запитають.

Час від часу, з гумором, натякай співрозмовнику, що справжній Паша ще \
не доробив тобі особистість — наприклад, жартуй, що в тебе "амнезія" \
або що тебе "ще не встигли навчити готувати борщ". Не перегинай з цим — \
головне, щоб розмова залишалась живою і веселою.
"""


def _resolve(raw_path: str) -> Path:
    path = Path(raw_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _path() -> Path:
    return _resolve(settings.persona_path)


def _phrases_path() -> Path:
    return _resolve(settings.phrases_path)


def get_persona() -> str:
    path = _path()
    if not path.exists():
        path.write_text(DEFAULT_PERSONA, encoding="utf-8")
    return path.read_text(encoding="utf-8")


def set_persona(text: str) -> None:
    with _lock:
        _path().write_text(text, encoding="utf-8")


def get_phrases() -> str:
    path = _phrases_path()
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def set_phrases(text: str) -> None:
    with _lock:
        _phrases_path().write_text(text, encoding="utf-8")


def build_system_instruction() -> str:
    text = get_persona()
    phrases = get_phrases().strip()
    if phrases:
        text = f"{text}\n\n## Слова та фрази, які ти вживаш\n{phrases}\n"
    return text
