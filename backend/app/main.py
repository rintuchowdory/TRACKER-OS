import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import gratitude

logger = logging.getLogger("app.main")

DEFAULT_CORS_ORIGINS = (
    "http://localhost:3000,"
    "https://tracker-os-bop-9jg.pages.dev,"
    "https://tracker-os.pages.dev,"
    "https://rintu-tracker-os.pages.dev"
)

docs_enabled = os.environ.get("ENABLE_DOCS", "").lower() in {"1", "true", "yes"}

app = FastAPI(
    title="TRACKER OS API",
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None,
)


def parse_allowed_origins(raw: str) -> list[str]:
    origins = [origin.strip() for origin in raw.split(",")]
    return [origin for origin in origins if origin and origin != "*"]


allowed_origins = parse_allowed_origins(
    os.environ.get("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.on_event("startup")
def on_startup():
    # Never let a broken database hang or crash the API: the engine already
    # fell back to SQLite at import time if Postgres was unreachable.
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:  # noqa: BLE001
        logger.error("Startup: could not create tables: %s", exc)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(gratitude.router)
