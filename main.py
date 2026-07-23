from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routes import admin, guest

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="Pasha")
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
app.include_router(guest.router)
app.include_router(admin.router)
