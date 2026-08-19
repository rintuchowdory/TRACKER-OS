import importlib

from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient
from sqlalchemy import inspect

from app import main
from app.database import Base, engine


def cors_middleware(app):
    return next(m for m in app.user_middleware if m.cls is CORSMiddleware)


def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_gratitude_router_is_mounted(client):
    assert client.get("/api/gratitude").status_code == 200
    assert client.get("/api/gratitude/today").status_code == 200
    assert client.get("/api/unknown").status_code == 404


def test_startup_creates_tables():
    Base.metadata.drop_all(bind=engine)
    assert "gratitude_entries" not in inspect(engine).get_table_names()

    with TestClient(main.app):
        assert "gratitude_entries" in inspect(engine).get_table_names()


def test_cors_allows_configured_origin(client):
    response = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_cors_rejects_unknown_origin(client):
    response = client.get("/health", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in response.headers


def test_default_allowed_origins(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    reloaded = importlib.reload(main)
    try:
        assert reloaded.allowed_origins == [
            "http://localhost:3000",
            "https://rintu-tracker-os.pages.dev",
        ]
    finally:
        monkeypatch.undo()
        importlib.reload(main)


def test_allowed_origins_are_read_from_environment(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "https://a.example,https://b.example")
    reloaded = importlib.reload(main)
    try:
        assert reloaded.allowed_origins == ["https://a.example", "https://b.example"]
        assert cors_middleware(reloaded.app).kwargs["allow_origins"] == [
            "https://a.example",
            "https://b.example",
        ]
    finally:
        monkeypatch.undo()
        importlib.reload(main)
