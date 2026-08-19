import datetime as dt
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GratitudeEntry
from app.schemas import GratitudeIn, GratitudeOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/gratitude", tags=["gratitude"])


@router.get("", response_model=list[GratitudeOut])
def list_entries(db: Session = Depends(get_db)):
    stmt = select(GratitudeEntry).order_by(GratitudeEntry.entry_date.desc()).limit(90)
    return db.scalars(stmt).all()


@router.get("/today", response_model=GratitudeOut | None)
def get_today(db: Session = Depends(get_db)):
    today = dt.date.today()
    stmt = select(GratitudeEntry).where(GratitudeEntry.entry_date == today)
    return db.scalars(stmt).first()


@router.post("", response_model=GratitudeOut)
def save_today(payload: GratitudeIn, db: Session = Depends(get_db)):
    today = dt.date.today()
    stmt = select(GratitudeEntry).where(GratitudeEntry.entry_date == today)
    entry = db.scalars(stmt).first()

    if entry is None:
        entry = GratitudeEntry(entry_date=today)
        db.add(entry)

    entry.item_1 = payload.item_1
    entry.item_2 = payload.item_2
    entry.item_3 = payload.item_3

    try:
        db.commit()
    except IntegrityError:
        # A concurrent request inserted today's row first; update that one.
        db.rollback()
        entry = db.scalars(stmt).first()
        if entry is None:
            logger.exception("Conflict saving gratitude entry for %s", today)
            raise HTTPException(status_code=409, detail="Could not save today's entry, please retry.")
        entry.item_1 = payload.item_1
        entry.item_2 = payload.item_2
        entry.item_3 = payload.item_3
        db.commit()

    db.refresh(entry)
    return entry
