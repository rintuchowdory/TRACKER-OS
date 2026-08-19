import datetime as dt

from pydantic import BaseModel, ConfigDict, Field

ITEM_MAX_LENGTH = 500


class GratitudeIn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    item_1: str = Field(default="", max_length=ITEM_MAX_LENGTH)
    item_2: str = Field(default="", max_length=ITEM_MAX_LENGTH)
    item_3: str = Field(default="", max_length=ITEM_MAX_LENGTH)


class GratitudeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entry_date: dt.date
    item_1: str
    item_2: str
    item_3: str
    created_at: dt.datetime
