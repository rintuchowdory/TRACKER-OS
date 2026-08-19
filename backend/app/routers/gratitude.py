import datetime as dt

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GratitudeEntry
from app.schemas import GratitudeIn, GratitudeOut

router = APIRouter(prefix="/api/gratitude", tags=["gratitude"])


def entry_for_date(db: Session, day: dt.date) -> GratitudeEntry | None:
    stmt = select(GratitudeEntry).where(GratitudeEntry.entry_date == day)
    return db.scalars(stmt).first()


@router.get("", response_model=list[GratitudeOut])
def list_entries(db: Session = Depends(get_db)):
    stmt = select(GratitudeEntry).order_by(GratitudeEntry.entry_date.desc()).limit(90)
    return db.scalars(stmt).all()


@router.get("/today", response_model=GratitudeOut | None)
def get_today(db: Session = Depends(get_db)):
    return entry_for_date(db, dt.date.today())


@router.post("", response_model=GratitudeOut)
def save_today(payload: GratitudeIn, db: Session = Depends(get_db)):
    today = dt.date.today()
    entry = entry_for_date(db, today)

    if entry is None:
        entry = GratitudeEntry(entry_date=today)
        db.add(entry)

    entry.item_1 = payload.item_1
    entry.item_2 = payload.item_2
    entry.item_3 = payload.item_3

    db.commit()
    db.refresh(entry)
    return entry
