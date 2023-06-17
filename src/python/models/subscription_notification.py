import datetime
from sqlalchemy.orm import Mapped, mapped_column

from ..config import db


class SubscriptionNotification(db.Model):  # type: ignore
    __tablename__ = "subscription_notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True), default=datetime.datetime.utcnow
    )
    processed_at: Mapped[datetime.datetime] = mapped_column(db.TIMESTAMP(timezone=True))
    collection_type: Mapped[str] = mapped_column(db.Unicode(100))
    date: Mapped[datetime.datetime] = mapped_column(db.TIMESTAMP(timezone=True))
    fitbit_user_id: Mapped[str] = mapped_column(db.Unicode(100))

    def __repr__(self) -> str:
        return "<SubscriptionNotification {id}>".format(id=self.id)
