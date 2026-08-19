import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.database import Base, engine
from app.routers import gratitude

logger = logging.getLogger(__name__)

app = FastAPI(title="TRACKER OS API")

allowed_origins = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,https://rintu-tracker-os.pages.dev",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
    except SQLAlchemyError:
        logger.exception("Could not create database schema at startup")
        raise


@app.exception_handler(SQLAlchemyError)
def handle_database_error(request: Request, exc: SQLAlchemyError):
    logger.error(
        "Database error while handling %s %s",
        request.method,
        request.url.path,
        exc_info=exc,
    )
    return JSONResponse(
        status_code=503,
        content={"detail": "Database unavailable, please retry."},
    )


@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except SQLAlchemyError:
        logger.exception("Health check failed: database unreachable")
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "unreachable"},
        )
    return {"status": "ok", "database": "ok"}


app.include_router(gratitude.router)
