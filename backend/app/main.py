import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import gratitude

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
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(gratitude.router)
