import datetime
import requests
import sqlalchemy
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional

from ..config import db


class User(db.Model):  # type: ignore
    __tablename__ = "users"
    fitbit_user_id = db.Column(db.Unicode(100), primary_key=True)
    display_name = db.Column(db.Unicode(100), nullable=False)
    created_at = db.Column(
        db.TIMESTAMP(timezone=True), default=datetime.datetime.utcnow, nullable=False
    )
    fitbit_access_token = db.Column(db.Unicode(500), nullable=False)
    fitbit_refresh_token = db.Column(db.Unicode(100), nullable=False)
    synced_at = db.Column(db.TIMESTAMP(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return "<User {fitbit_user_id}>".format(fitbit_user_id=self.fitbit_user_id)

    @property
    def fitbit_subscription(self) -> "FitbitSubscription":
        sub = FitbitSubscription.query.filter(
            FitbitSubscription.fitbit_user_id == self.fitbit_user_id
        ).first
        if sub is None:
            raise ValueError(
                f"Subscription expected but not found for user {self.fitbit_user_id}"
            )

        return sub

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

    def create_subscription(self) -> Optional["FitbitSubscription"]:
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
            return None

        return FitbitSubscription(fitbit_user_id=self.fitbit_user_id)


class FitbitSubscription(db.Model):  # type: ignore
    __tablename__ = "fitbit_subscriptions"
    id = db.Column(db.Integer, primary_key=True)
    fitbit_user_id = db.Column(db.Unicode(100), nullable=False)

    def __repr__(self) -> str:
        return "<FitbitSubscription {fitbit_user_id}>".format(
            fitbit_user_id=self.fitbit_user_id
        )

    @property
    def user(self) -> "User":
        u = User.query.filter(User.fitbit_user_id == self.fitbit_user_id).first
        if u is None:
            raise ValueError(
                f"User expected but none found for fitbit subscription {self.fitbit_user_id}"
            )
        return u
