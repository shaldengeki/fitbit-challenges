import datetime
import decimal
import itertools
import random
import requests
from sqlalchemy import desc, ForeignKey
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.orm import mapped_column
from sqlalchemy.sql import func
from sqlalchemy.sql.functions import now
from typing import Generator, Optional

from .config import db
from .fitbit_client import FitbitClient


class Challenge(db.Model):  # type: ignore
    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_type: Mapped[int]
    users: Mapped[str]
    created_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True),
        default=lambda: datetime.datetime.now(tz=datetime.timezone.utc),
    )
    start_at: Mapped[datetime.datetime] = mapped_column(db.TIMESTAMP(timezone=True))
    end_at: Mapped[datetime.datetime] = mapped_column(db.TIMESTAMP(timezone=True))

    bingo_card: Mapped["BingoCard"] = relationship(back_populates="challenge")

    def __repr__(self) -> str:
        return "<Challenge {id}>".format(id=self.id)

    @property
    def ended(self) -> bool:
        return datetime.datetime.now(tz=datetime.timezone.utc) >= self.end_at

    @property
    def seal_at(self) -> datetime.datetime:
        return self.end_at + datetime.timedelta(hours=24)

    @property
    def sealed(self) -> bool:
        return datetime.datetime.now(tz=datetime.timezone.utc) >= self.seal_at

    @property
    def users_list(self) -> list["User"]:
        user_ids = self.users.split(",")
        return (
            User.query.filter(User.fitbit_user_id.in_(user_ids))
            .order_by(User.display_name)
            .all()
        )

    def activities(self) -> list["UserActivity"]:
        return (
            UserActivity.query.filter(UserActivity.user.in_(self.users.split(",")))
            .filter(
                func.date_trunc("day", UserActivity.record_date)
                >= func.date_trunc("day", self.start_at)
            )
            .filter(UserActivity.record_date < self.end_at)
            .filter(UserActivity.created_at < self.seal_at)
            .order_by(desc(UserActivity.created_at))
            .all()
        )


class FitbitSubscription(db.Model):  # type: ignore
    __tablename__ = "fitbit_subscriptions"
    id: Mapped[int] = mapped_column(primary_key=True)
    fitbit_user_id: Mapped[str] = mapped_column(ForeignKey("users.fitbit_user_id"))
    user: Mapped["User"] = relationship(back_populates="fitbit_subscription")

    def __repr__(self) -> str:
        return "<FitbitSubscription {fitbit_user_id}>".format(
            fitbit_user_id=self.fitbit_user_id
        )


class SubscriptionNotification(db.Model):  # type: ignore
    __tablename__ = "subscription_notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True),
        default=lambda: datetime.datetime.now(tz=datetime.timezone.utc),
    )
    processed_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        db.TIMESTAMP(timezone=True)
    )
    collection_type: Mapped[str]
    date: Mapped[datetime.datetime] = mapped_column(db.TIMESTAMP(timezone=True))
    fitbit_user_id: Mapped[str] = mapped_column(ForeignKey("users.fitbit_user_id"))

    user: Mapped["User"] = relationship(back_populates="subscription_notifications")

    def __repr__(self) -> str:
        return "<SubscriptionNotification {id}>".format(id=self.id)


class User(db.Model):  # type: ignore
    __tablename__ = "users"

    fitbit_user_id: Mapped[str] = mapped_column(db.Unicode(100), primary_key=True)
    display_name: Mapped[str]
    created_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True),
        default=lambda: datetime.datetime.now(tz=datetime.timezone.utc),
    )
    fitbit_access_token: Mapped[str]
    fitbit_refresh_token: Mapped[str]
    synced_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        db.TIMESTAMP(timezone=True), nullable=True
    )

    fitbit_subscription: Mapped["FitbitSubscription"] = relationship(
        back_populates="user"
    )
    subscription_notifications: Mapped[list["SubscriptionNotification"]] = relationship(
        back_populates="user"
    )
    activities: Mapped[list["UserActivity"]] = relationship(
        back_populates="fitbit_user"
    )
    bingo_cards: Mapped[list["BingoCard"]] = relationship(back_populates="user")

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

    def create_subscription(
        self, client: FitbitClient
    ) -> Optional["FitbitSubscription"]:
        if self.fitbit_subscription is not None:
            return self.fitbit_subscription

        new_subscription = FitbitSubscription(fitbit_user_id=self.fitbit_user_id)
        db.session.add(new_subscription)
        db.session.commit()

        if not client.create_subscription(
            self.fitbit_user_id, new_subscription.id, self.fitbit_access_token
        ):
            db.session.delete(new_subscription)
            db.session.commit()
            return None

        return new_subscription

    def challenges_query(self):
        return Challenge.query.filter(Challenge.users.contains(self.fitbit_user_id))

    def challenges(self) -> list["Challenge"]:
        return self.challenges_query().all()

    def past_challenges(self) -> list["Challenge"]:
        return self.challenges_query().filter(Challenge.end_at < now()).all()

    def active_challenges(self) -> list["Challenge"]:
        return self.challenges_query().filter(Challenge.end_at >= now()).all()

    def activities_within_timespan(
        self, start: datetime.datetime, end: datetime.datetime
    ) -> list["UserActivity"]:
        return (
            UserActivity.query.filter(
                UserActivity.fitbit_user_id == self.fitbit_user_id
            )
            .filter(UserActivity.created_at >= start)
            .filter(UserActivity.created_at < end)
            .all()
        )


class UserActivity(db.Model):  # type: ignore
    __tablename__ = "user_activities"
    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True),
        default=lambda: datetime.datetime.now(tz=datetime.timezone.utc),
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True),
        default=lambda: datetime.datetime.now(tz=datetime.timezone.utc),
    )
    record_date: Mapped[datetime.date] = mapped_column(
        db.DATE, default=datetime.date.today
    )
    user: Mapped[str] = mapped_column(ForeignKey("users.fitbit_user_id"))
    steps: Mapped[int]
    active_minutes: Mapped[int]
    distance_km: Mapped[decimal.Decimal] = mapped_column(db.DECIMAL(5, 2))

    fitbit_user: Mapped["User"] = relationship(back_populates="activities")

    def __repr__(self) -> str:
        return "<UserActivity {id}>".format(id=self.id)


def apply_fuzz_factor_to_int(amount: int, percentage: int) -> int:
    return int(
        amount * (1 + float(random.randint(-1 * percentage, percentage)) / percentage)
    )


def apply_fuzz_factor_to_decimal(
    amount: decimal.Decimal, percentage: int
) -> decimal.Decimal:
    return decimal.Decimal(
        float(amount)
        * (1 + float(random.randint(-1 * percentage, percentage)) / percentage)
    )


class BingoCardPattern:
    @property
    def pattern(self) -> list[list[int]]:
        raise NotImplementedError

    def required_coordinate(self, x: int, y: int) -> bool:
        return bool(self.pattern[y][x] == 1)


class TenBingoCardPattern(BingoCardPattern):
    @property
    def pattern(self) -> list[list[int]]:
        return [
            [1, 0, 1, 1, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 1, 1, 1],
        ]


class SailboatBingoCardPattern(BingoCardPattern):
    @property
    def pattern(self) -> list[list[int]]:
        return [
            [0, 0, 1, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0],
        ]


class HouseBingoCardPattern(BingoCardPattern):
    @property
    def pattern(self) -> list[list[int]]:
        return [
            [0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [1, 1, 1, 1, 1],
            [0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0],
        ]


class BingoCard(db.Model):  # type: ignore
    __tablename__ = "bingo_cards"

    id: Mapped[int] = mapped_column(primary_key=True)
    fitbit_user_id: Mapped[str] = mapped_column(ForeignKey("users.fitbit_user_id"))
    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.id"))
    rows: Mapped[int]
    columns: Mapped[int]
    created_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True),
        default=lambda: datetime.datetime.now(tz=datetime.timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="bingo_cards")
    challenge: Mapped["Challenge"] = relationship(back_populates="bingo_card")
    bingo_tiles: Mapped[list["BingoTile"]] = relationship(
        back_populates="bingo_card",
        order_by="(BingoTile.coordinate_y, BingoTile.coordinate_x)",
    )

    PATTERNS: list[BingoCardPattern] = [
        HouseBingoCardPattern(),
        SailboatBingoCardPattern(),
        TenBingoCardPattern(),
    ]

    def __repr__(self) -> str:
        return "<BingoCard {id}>".format(id=self.id)

    def flipped_tiles(self) -> Generator["BingoTile", None, None]:
        for tile in self.bingo_tiles:
            if tile.flipped:
                yield tile

    def unflipped_tiles(self) -> Generator["BingoTile", None, None]:
        for tile in self.bingo_tiles:
            if not tile.flipped:
                yield tile

    def total_cost_steps(self) -> int:
        return sum(tile.steps for tile in self.bingo_tiles if tile.steps is not None)

    def total_cost_active_minutes(self) -> int:
        return sum(
            tile.active_minutes
            for tile in self.bingo_tiles
            if tile.active_minutes is not None
        )

    def total_cost_distance_km(self) -> decimal.Decimal:
        return decimal.Decimal(
            sum(
                tile.distance_km
                for tile in self.bingo_tiles
                if tile.distance_km is not None
            )
        )

    def create_for_user_and_challenge(
        self,
        user: "User",
        challenge: "Challenge",
        start: datetime.datetime,
        end: datetime.datetime,
    ) -> "BingoCard":
        # Assign this card to the user and challenge.
        self.user = user
        self.challenge = challenge

        # Pick one of a set of victory patterns.
        pattern = random.choice(BingoCard.PATTERNS)

        # Compute the total amounts for each resource.
        duration = end - start
        window_end = datetime.datetime.now(tz=datetime.timezone.utc)
        window_start = window_end - duration

        total_steps = 0
        total_active_minutes = 0
        total_distance_km: decimal.Decimal = decimal.Decimal(0)

        for activity in user.activities_within_timespan(
            start=window_start, end=window_end
        ):
            total_steps += activity.steps
            total_active_minutes += activity.active_minutes
            total_distance_km += activity.distance_km

        total_steps = apply_fuzz_factor_to_int(total_steps, 20)
        total_active_minutes = apply_fuzz_factor_to_int(total_active_minutes, 20)
        total_distance_km = apply_fuzz_factor_to_decimal(total_distance_km, 20)

        # Create 25=5x5 tiles.
        step_tiles = [BingoTile(bingo_card=self) for _ in range(random.randint(7, 9))]
        active_minutes_tiles = [
            BingoTile(bingo_card=self) for _ in range(random.randint(7, 9))
        ]
        distance_km_tiles = [
            BingoTile(bingo_card=self)
            for _ in range(25 - len(step_tiles) - len(active_minutes_tiles))
        ]

        # Create a random ordering of tile coordinates.
        coordinates = list(
            itertools.product(
                list(range(5)),
                list(range(5)),
            )
        )
        random.shuffle(coordinates)

        for step_tile in step_tiles:
            # Assign ~1/8 or ~1/9 of the total resource amount
            step_tile.steps = apply_fuzz_factor_to_int(
                int(total_steps / len(step_tiles)), 20
            )

            # Assign a coordinate
            (step_tile.coordinate_x, step_tile.coordinate_y) = coordinates.pop()

            # Set whether or not it's required for a win.
            step_tile.required_for_win = pattern.required_coordinate(
                x=step_tile.coordinate_x, y=step_tile.coordinate_y
            )
            db.session.add(step_tile)

        for active_minutes_tile in active_minutes_tiles:
            # Assign ~1/8 or ~1/9 of the total resource amount
            active_minutes_tile.active_minutes = apply_fuzz_factor_to_int(
                int(total_active_minutes / len(active_minutes_tiles)), 20
            )

            # Assign a coordinate
            (
                active_minutes_tile.coordinate_x,
                active_minutes_tile.coordinate_y,
            ) = coordinates.pop()

            # Set whether or not it's required for a win.
            active_minutes_tile.required_for_win = pattern.required_coordinate(
                x=active_minutes_tile.coordinate_x, y=active_minutes_tile.coordinate_y
            )
            db.session.add(active_minutes_tile)

        for distance_km_tile in distance_km_tiles:
            # Assign ~1/8 or ~1/9 of the total resource amount
            distance_km_tile.distance_km = apply_fuzz_factor_to_decimal(
                total_distance_km / len(distance_km_tiles), 20
            )

            # Assign a coordinate
            (
                distance_km_tile.coordinate_x,
                distance_km_tile.coordinate_y,
            ) = coordinates.pop()

            # Set whether or not it's required for a win.
            distance_km_tile.required_for_win = pattern.required_coordinate(
                x=distance_km_tile.coordinate_x, y=distance_km_tile.coordinate_y
            )
            db.session.add(distance_km_tile)

        # Persist everything.
        self.bingo_tiles = step_tiles + active_minutes_tiles + distance_km_tiles
        db.session.add(self)
        db.session.commit()

        return self


class BingoTile(db.Model):  # type: ignore
    __tablename__ = "bingo_tiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    bingo_card_id: Mapped[str] = mapped_column(ForeignKey("bingo_cards.id"))
    steps: Mapped[Optional[int]]
    active_minutes: Mapped[Optional[int]]
    distance_km: Mapped[Optional[decimal.Decimal]]
    coordinate_x: Mapped[int]
    coordinate_y: Mapped[int]
    bonus_type: Mapped[Optional[int]]
    bonus_amount: Mapped[Optional[int]]
    flipped: Mapped[bool] = mapped_column(default=False)
    flipped_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        db.TIMESTAMP(timezone=True)
    )
    required_for_win: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        db.TIMESTAMP(timezone=True),
        default=lambda: datetime.datetime.now(tz=datetime.timezone.utc),
    )

    bingo_card: Mapped["BingoCard"] = relationship(back_populates="bingo_tiles")

    def __repr__(self) -> str:
        return "<BingoTile {id}>".format(id=self.id)

    def flip(self) -> bool:
        self.flipped = not self.flipped
        if self.flipped:
            self.flipped_at = datetime.datetime.now(tz=datetime.timezone.utc)
        else:
            self.flipped_at = None
        return self.flipped
