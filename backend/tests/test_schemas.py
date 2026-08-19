import datetime as dt

import pytest
from pydantic import ValidationError

from app.models import GratitudeEntry
from app.schemas import GratitudeIn, GratitudeOut


def test_gratitude_in_defaults_to_empty_strings():
    payload = GratitudeIn()
    assert (payload.item_1, payload.item_2, payload.item_3) == ("", "", "")


def test_gratitude_in_rejects_non_string_items():
    with pytest.raises(ValidationError):
        GratitudeIn(item_1=[])


def test_gratitude_out_reads_from_orm_attributes():
    entry = GratitudeEntry(
        id=7,
        entry_date=dt.date(2026, 1, 2),
        item_1="a",
        item_2="b",
        item_3="c",
        created_at=dt.datetime(2026, 1, 2, 3, 4, 5),
    )

    out = GratitudeOut.model_validate(entry)
    assert out.id == 7
    assert out.entry_date == dt.date(2026, 1, 2)
    assert out.created_at == dt.datetime(2026, 1, 2, 3, 4, 5)
    assert (out.item_1, out.item_2, out.item_3) == ("a", "b", "c")


def test_gratitude_out_requires_all_fields():
    with pytest.raises(ValidationError):
        GratitudeOut(id=1)
