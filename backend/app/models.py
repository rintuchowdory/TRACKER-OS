import datetime as dt

from sqlalchemy import Date, DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class GratitudeEntry(Base):
    __tablename__ = "gratitude_entries"
    __table_args__ = (UniqueConstraint("entry_date", name="uq_gratitude_entry_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    entry_date: Mapped[dt.date] = mapped_column(Date, default=dt.date.today, index=True)
    item_1: Mapped[str] = mapped_column(String(500), default="")
    item_2: Mapped[str] = mapped_column(String(500), default="")
    item_3: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
