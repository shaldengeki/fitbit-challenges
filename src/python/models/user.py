import datetime
import requests
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from ..config import db


class User(db.Model):  # type: ignore
    __tablename__ = "users"

    fitbit_user_id: Mapped[str] = mapped_column(db.Unicode(100), primary_key=True)
    display_name: Mapped[str] = mapped_column(db.Unicode(100))
    created_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True), default=datetime.datetime.utcnow
    )
    fitbit_access_token: Mapped[str] = mapped_column(db.Unicode(500))
    fitbit_refresh_token: Mapped[str] = mapped_column(db.Unicode(100))
    synced_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        db.TIMESTAMP(timezone=True), nullable=True
    )
    fitbit_subscription_id: Mapped[int] = mapped_column(db.Identity())

    def __repr__(self) -> str:
        return "<User {fitbit_user_id}>".format(fitbit_user_id=self.fitbit_user_id)

    @staticmethod
    def fetch_display_name_with_user_id_and_access_token(
        user_id: str, access_token: str
    ) -> str:
        profile_request = requests.get(
            f"https://api.fitbit.com/1/user/{user_id}/profile.json",
            headers={
                "Authorization": f"Bearer {access_token}",
            },
        )
        return profile_request.json()["user"]["displayName"]

    def fetch_display_name(self) -> str:
        return self.__class__.fetch_display_name_with_user_id_and_access_token(
            self.fitbit_user_id, self.fitbit_access_token
        )

    @classmethod
    def create_with_user_id_and_tokens(
        cls, user_id: str, access_token: str, refresh_token: str
    ):
        display_name = cls.fetch_display_name_with_user_id_and_access_token(
            user_id, access_token
        )
        return (
            insert(cls.__table__)
            .values(
                fitbit_user_id=user_id,
                display_name=display_name,
                fitbit_access_token=access_token,
                fitbit_refresh_token=refresh_token,
            )
            .on_conflict_do_update(
                constraint="users_pkey",
                set_={
                    "display_name": display_name,
                    "fitbit_access_token": access_token,
                    "fitbit_refresh_token": refresh_token,
                },
            )
        )

    def create_subscription(self) -> requests.Response:
        sub_request = requests.post(
            f"https://api.fitbit.com/1/user/{self.fitbit_user_id}/activities/apiSubscriptions/{self.fitbit_subscription_id}.json",
            headers={
                "Authorization": f"Bearer {self.fitbit_access_token}",
                "Accept": "application/json",
            },
            json={},
        )

        if sub_request.status_code not in (200, 201):
            actual_subscription_id = sub_request.json()["subscriptionId"]
            self.fitbit_subscription_id = actual_subscription_id
