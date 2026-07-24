import logging
from pathlib import Path

from fastapi import APIRouter, Cookie, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse, StreamingResponse
from fastapi.templating import Jinja2Templates

from app import gemini_client, persona, ratelimit, security
from app.config import settings

router = APIRouter()
logger = logging.getLogger("pasha")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@router.get("/", response_class=HTMLResponse)
async def login_page(request: Request, pasha_session: str | None = Cookie(default=None)):
    if security.read_guest_sid(pasha_session):
        return RedirectResponse("/chat", status_code=303)
    return templates.TemplateResponse(
        request, "login.html", {"error": None, "name": persona.get_name()}
    )


@router.post("/login")
async def login(password: str = Form(...)):
    if password != settings.guest_password:
        response = templates.get_template("login.html").render(
            error="Неправильний пароль. Спробуй ще раз."
        )
        return HTMLResponse(response, status_code=401)

    response = RedirectResponse("/chat", status_code=303)
    response.set_cookie(
        security.GUEST_COOKIE,
        security.create_guest_cookie(),
        max_age=security.MAX_AGE_SECONDS,
        httponly=True,
        samesite="lax",
    )
    return response


@router.post("/logout")
async def logout():
    response = RedirectResponse("/", status_code=303)
    response.delete_cookie(security.GUEST_COOKIE)
    return response


@router.get("/chat", response_class=HTMLResponse)
async def chat_page(request: Request, pasha_session: str | None = Cookie(default=None)):
    if not security.read_guest_sid(pasha_session):
        return RedirectResponse("/", status_code=303)
    return templates.TemplateResponse(
        request,
        "chat.html",
        {"name": persona.get_name(), "photo_version": persona.get_photo_version()},
    )


@router.post("/api/chat")
async def chat_api(request: Request, pasha_session: str | None = Cookie(default=None)):
    sid = security.read_guest_sid(pasha_session)
    if not sid:
        return HTMLResponse("Не авторизовано", status_code=401)

    body = await request.json()
    message = (body.get("message") or "").strip()
    history = body.get("history") or []

    if not message:
        return HTMLResponse("Порожнє повідомлення", status_code=400)
    if len(message) > 4000:
        return HTMLResponse("Повідомлення задовге", status_code=400)

    try:
        ratelimit.check_and_record(sid)
    except ratelimit.RateLimitError as exc:
        return HTMLResponse(
            f"Паша трохи втомився відповідати так швидко. Спробуй ще раз за "
            f"{exc.retry_after_seconds:.0f} сек.",
            status_code=429,
        )

    system_instruction = persona.build_system_instruction()

    async def generate():
        try:
            async for chunk in gemini_client.stream_reply(system_instruction, history, message):
                yield chunk
        except Exception:
            logger.exception("Gemini stream failed")
            yield "\n\n[Паша щойно відволікся і не зміг відповісти. Спробуй написати ще раз.]"

    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")
