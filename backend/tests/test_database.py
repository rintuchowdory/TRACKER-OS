import importlib
import os

from sqlalchemy import text

from app import database


def test_get_db_yields_usable_session_and_closes_it():
    generator = database.get_db()
    session = next(generator)

    assert session.execute(text("select 1")).scalar() == 1
    assert session.is_active

    closed = next(generator, "exhausted")
    assert closed == "exhausted"
    assert not session.in_transaction()


def test_get_db_closes_session_even_when_caller_raises():
    generator = database.get_db()
    session = next(generator)

    generator.close()
    assert not session.in_transaction()


def test_engine_uses_database_url_from_environment(monkeypatch, tmp_path):
    url = f"sqlite+pysqlite:///{tmp_path / 'other.db'}"
    monkeypatch.setenv("DATABASE_URL", url)

    reloaded = importlib.reload(database)
    try:
        assert reloaded.DATABASE_URL == url
        assert str(reloaded.engine.url) == url
    finally:
        monkeypatch.undo()
        importlib.reload(database)


def test_database_url_falls_back_to_sqlite_when_unset(monkeypatch, tmp_path):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.chdir(tmp_path)

    reloaded = importlib.reload(database)
    try:
        assert reloaded.DATABASE_URL == ""
        assert reloaded.engine.url.drivername == "sqlite"
        assert reloaded.engine.url.database.endswith("tracker_os.db")
    finally:
        monkeypatch.undo()
        importlib.reload(database)
    assert os.environ["DATABASE_URL"].startswith("sqlite")


def test_unreachable_database_url_falls_back_to_sqlite(monkeypatch, tmp_path):
    # A stale Postgres URL must not hang the app: connect timeout, then SQLite.
    monkeypatch.setenv(
        "DATABASE_URL",
        "postgresql+psycopg2://tracker:tracker@localhost:59999/tracker_os",
    )
    monkeypatch.chdir(tmp_path)

    reloaded = importlib.reload(database)
    try:
        assert reloaded.engine.url.drivername == "sqlite"
    finally:
        monkeypatch.undo()
        importlib.reload(database)
