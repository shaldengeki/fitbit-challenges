import datetime
import decimal
from sqlalchemy.orm import Mapped, mapped_column

from ..config import db


class UserActivity(db.Model):  # type: ignore
    __tablename__ = "user_activities"
    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True), default=datetime.datetime.utcnow
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True), default=datetime.datetime.utcnow
    )
    record_date: Mapped[datetime.date] = mapped_column(
        db.DATE, default=datetime.date.today
    )
    user: Mapped[str] = mapped_column(db.Unicode(100))
    steps: Mapped[int] = mapped_column(db.Integer)
    active_minutes: Mapped[int] = mapped_column(db.Integer)
    distance_km: Mapped[decimal.Decimal] = mapped_column(db.DECIMAL(5, 2))

    def __repr__(self) -> str:
        return "<UserActivity {id}>".format(id=self.id)
