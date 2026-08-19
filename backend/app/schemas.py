import datetime as dt

from pydantic import BaseModel, ConfigDict


class GratitudeIn(BaseModel):
    item_1: str = ""
    item_2: str = ""
    item_3: str = ""


class GratitudeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entry_date: dt.date
    item_1: str
    item_2: str
    item_3: str
    created_at: dt.datetime
