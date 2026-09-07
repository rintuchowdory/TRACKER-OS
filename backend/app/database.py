import logging
import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

logger = logging.getLogger("app.database")

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

FALLBACK_SQLITE_URL = "sqlite:///./tracker_os.db"


class Base(DeclarativeBase):
    pass


def _build_engine(url: str):
    if url.startswith("sqlite"):
        return create_engine(
            url,
            pool_pre_ping=True,
            connect_args={"check_same_thread": False, "timeout": 10},
        )
    return create_engine(
        url,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 5},
    )


def _init_engine():
    """Pick the first reachable database.

    Tries the configured DATABASE_URL first; if it is unset, unreachable,
    or times out (e.g. a stale internal Postgres URL), falls back to a local
    SQLite file so the API always starts and serves requests.
    """
    candidates = [url for url in (DATABASE_URL, FALLBACK_SQLITE_URL) if url]
    for url in candidates:
        try:
            candidate = _build_engine(url)
            with candidate.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Using database: %s", url)
            return candidate
        except Exception as exc:  # noqa: BLE001 - want to survive any DB failure
            logger.warning("Database %s unavailable (%s); trying next candidate.", url, exc)
    raise RuntimeError("No usable database configured")


engine = _init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create tables, never crash the app if the DB rejects DDL."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:  # noqa: BLE001
        logger.error("Could not create tables: %s", exc)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
