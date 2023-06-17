import datetime
from sqlalchemy.orm import Mapped, mapped_column

from ..config import db


class Challenge(db.Model):  # type: ignore
    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_type: Mapped[int] = mapped_column(db.Integer)
    users: Mapped[str] = mapped_column(db.Unicode(500))
    created_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True), default=datetime.datetime.utcnow
    )
    start_at: Mapped[datetime.datetime] = mapped_column(db.TIMESTAMP(timezone=True))
    end_at: Mapped[datetime.datetime] = mapped_column(db.TIMESTAMP(timezone=True))

    def __repr__(self) -> str:
        return "<Challenge {id}>".format(id=self.id)

    @property
    def ended(self) -> bool:
        return datetime.datetime.now() >= self.end_at

    @property
    def seal_at(self) -> datetime.datetime:
        return self.end_at + datetime.timedelta(hours=24)

    @property
    def sealed(self) -> bool:
        return datetime.datetime.now() >= self.seal_at
