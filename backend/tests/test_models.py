import datetime as dt

import pytest
from sqlalchemy.exc import IntegrityError

from app.models import GratitudeEntry


def test_defaults_are_applied_on_insert(db):
    entry = GratitudeEntry()
    db.add(entry)
    db.commit()
    db.refresh(entry)

    assert entry.entry_date == dt.date.today()
    assert (entry.item_1, entry.item_2, entry.item_3) == ("", "", "")
    assert isinstance(entry.created_at, dt.datetime)


def test_entry_date_is_unique(db):
    today = dt.date.today()
    db.add(GratitudeEntry(entry_date=today))
    db.commit()

    db.add(GratitudeEntry(entry_date=today))
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_tablename_and_unique_constraint_name():
    assert GratitudeEntry.__tablename__ == "gratitude_entries"
    constraint_names = {c.name for c in GratitudeEntry.__table__.constraints}
    assert "uq_gratitude_entry_date" in constraint_names
