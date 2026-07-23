from pathlib import Path

from fastapi import APIRouter, Cookie, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

from app import persona, security
from app.config import settings

router = APIRouter(prefix="/admin")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@router.get("/login", response_class=HTMLResponse)
async def admin_login_page(request: Request, pasha_admin_session: str | None = Cookie(default=None)):
    if security.read_admin_sid(pasha_admin_session):
        return RedirectResponse("/admin", status_code=303)
    return templates.TemplateResponse(request, "admin_login.html", {"error": None})


@router.post("/login")
async def admin_login(password: str = Form(...)):
    if password != settings.admin_password:
        response = templates.get_template("admin_login.html").render(
            error="Неправильний пароль."
        )
        return HTMLResponse(response, status_code=401)

    response = RedirectResponse("/admin", status_code=303)
    response.set_cookie(
        security.ADMIN_COOKIE,
        security.create_admin_cookie(),
        max_age=security.MAX_AGE_SECONDS,
        httponly=True,
        samesite="lax",
    )
    return response


@router.post("/logout")
async def admin_logout():
    response = RedirectResponse("/admin/login", status_code=303)
    response.delete_cookie(security.ADMIN_COOKIE)
    return response


@router.get("", response_class=HTMLResponse)
async def admin_page(request: Request, pasha_admin_session: str | None = Cookie(default=None)):
    if not security.read_admin_sid(pasha_admin_session):
        return RedirectResponse("/admin/login", status_code=303)
    return templates.TemplateResponse(request, "admin.html", {"persona_text": persona.get_persona()})


@router.put("/api/persona")
async def update_persona(request: Request, pasha_admin_session: str | None = Cookie(default=None)):
    if not security.read_admin_sid(pasha_admin_session):
        return JSONResponse({"error": "Не авторизовано"}, status_code=401)

    body = await request.json()
    text = (body.get("text") or "").strip()
    if not text:
        return JSONResponse({"error": "Текст персони не може бути порожнім"}, status_code=400)

    persona.set_persona(text)
    return JSONResponse({"ok": True})
