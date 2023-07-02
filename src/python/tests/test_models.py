import datetime
import decimal

from typing import Generator

from ..models import (
    BingoCard,
    BingoCardPattern,
    BingoTile,
    Challenge,
    User,
    UserActivity,
    apply_fuzz_factor_to_int,
    apply_fuzz_factor_to_decimal,
)


def create_mock_datetime(returned_date: datetime.datetime) -> object:
    class MockDateTime(datetime.datetime):
        @classmethod
        def now(cls, *args, **kwargs):
            return returned_date

    return MockDateTime


class TestChallenge:
    def test_ended_for_current_second(self, monkeypatch):
        challenge = Challenge(
            end_at=datetime.datetime(
                year=2023,
                month=2,
                day=2,
                hour=0,
                minute=0,
                second=0,
                tzinfo=datetime.timezone.utc,
            )
        )
        monkeypatch.setattr(
            datetime,
            "datetime",
            create_mock_datetime(
                datetime.datetime(2023, 2, 2, 0, 0, 0, tzinfo=datetime.timezone.utc)
            ),
        )
        assert challenge.ended

    def test_ended_for_prior_time(self, monkeypatch):
        challenge = Challenge(
            end_at=datetime.datetime(
                year=2023,
                month=2,
                day=2,
                hour=0,
                minute=0,
                second=0,
                tzinfo=datetime.timezone.utc,
            )
        )
        monkeypatch.setattr(
            datetime,
            "datetime",
            create_mock_datetime(
                datetime.datetime(2023, 2, 3, 0, 0, 0, tzinfo=datetime.timezone.utc)
            ),
        )
        assert challenge.ended

    def test_ended_for_future_time(self, monkeypatch):
        challenge = Challenge(
            end_at=datetime.datetime(
                year=2023,
                month=2,
                day=2,
                hour=0,
                minute=0,
                second=0,
                tzinfo=datetime.timezone.utc,
            )
        )
        monkeypatch.setattr(
            datetime,
            "datetime",
            create_mock_datetime(
                datetime.datetime(2023, 2, 1, 0, 0, 0, tzinfo=datetime.timezone.utc)
            ),
        )
        assert not challenge.ended


def test_apply_fuzz_factor_to_int_minimum():
    assert 80 == apply_fuzz_factor_to_int(100, 20, -20)


def test_apply_fuzz_factor_to_int_midpoint():
    assert 100 == apply_fuzz_factor_to_int(100, 20, 0)


def test_apply_fuzz_factor_to_int_maximum():
    assert 120 == apply_fuzz_factor_to_int(100, 20, 20)


def test_apply_fuzz_factor_to_decimal_minimum():
    assert decimal.Decimal("0.8") == apply_fuzz_factor_to_decimal(
        decimal.Decimal("1.0"), 20, -20
    )


def test_apply_fuzz_factor_to_decimal_midpodecimal():
    assert decimal.Decimal("1.0") == apply_fuzz_factor_to_decimal(
        decimal.Decimal("1.0"), 20, 0
    )


def test_apply_fuzz_factor_to_decimal_maximum():
    assert decimal.Decimal("1.2") == apply_fuzz_factor_to_decimal(
        decimal.Decimal("1.0"), 20, 20
    )


class TestBingoTile:
    def test_flip_unflipped_tile(self, monkeypatch):
        curr_time = datetime.datetime.now(tz=datetime.timezone.utc)
        monkeypatch.setattr(
            datetime,
            "datetime",
            create_mock_datetime(curr_time),
        )

        t = BingoTile(flipped=False)
        t.flip()
        assert t.flipped
        assert curr_time == t.flipped_at

    def test_flip_flipped_tile(self):
        curr_time = datetime.datetime.now(tz=datetime.timezone.utc)
        t = BingoTile(flipped=True, flipped_at=curr_time)
        t.flip()
        assert t.flipped
        assert curr_time == t.flipped_at


class SampleBingoCardPattern(BingoCardPattern):
    @property
    def pattern(self) -> list[list[int]]:
        return [
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],
        ]


class TestBingoCardPattern:
    def test_required_coordinate_for_required_tile(self):
        assert SampleBingoCardPattern().required_coordinate(1, 1)

    def test_required_coordinate_for_non_required_tile(self):
        assert not SampleBingoCardPattern().required_coordinate(1, 0)

    def test_number_of_required_tiles(self):
        assert 5 == SampleBingoCardPattern().number_of_required_tiles


class TestBingoCard:
    def test_victory_tiles_returns_empty_when_no_tiles(self):
        c = BingoCard(bingo_tiles=[])
        assert 0 == len(list(c.victory_tiles()))

    def test_victory_tiles_returns_empty_when_all_tiles_not_required(self):
        t = BingoTile(required_for_win=False)
        c = BingoCard(bingo_tiles=[t])
        assert 0 == len(list(c.victory_tiles()))

    def test_victory_tiles_returns_tile_when_required(self):
        t1 = BingoTile(required_for_win=False)
        t2 = BingoTile(required_for_win=True)
        c = BingoCard(bingo_tiles=[t2, t1])
        victory_tiles = list(c.victory_tiles())
        assert 1 == len(victory_tiles)
        assert t2 in victory_tiles
        assert t1 not in victory_tiles

    def test_flipped_victory_tiles_returns_empty_when_no_tiles(self):
        c = BingoCard(bingo_tiles=[])
        assert 0 == len(list(c.flipped_victory_tiles()))

    def test_flipped_victory_tiles_returns_empty_when_all_tiles_not_required(self):
        t = BingoTile(flipped=True, required_for_win=False)
        c = BingoCard(bingo_tiles=[t])
        assert 0 == len(list(c.flipped_victory_tiles()))

    def test_flipped_victory_tiles_returns_empty_when_all_tiles_not_flipped(self):
        t = BingoTile(flipped=False, required_for_win=True)
        c = BingoCard(bingo_tiles=[t])
        assert 0 == len(list(c.flipped_victory_tiles()))

    def test_flipped_victory_tiles_returns_tile_when_required(self):
        t1 = BingoTile(flipped=True, required_for_win=False)
        t2 = BingoTile(flipped=True, required_for_win=True)
        c = BingoCard(bingo_tiles=[t2, t1])
        victory_tiles = list(c.flipped_victory_tiles())
        assert 1 == len(victory_tiles)
        assert t2 in victory_tiles
        assert t1 not in victory_tiles

    def test_flipped_victory_tiles_returns_tile_when_flipped(self):
        t1 = BingoTile(flipped=False, required_for_win=True)
        t2 = BingoTile(flipped=True, required_for_win=True)
        c = BingoCard(bingo_tiles=[t2, t1])
        victory_tiles = list(c.flipped_victory_tiles())
        assert 1 == len(victory_tiles)
        assert t2 in victory_tiles
        assert t1 not in victory_tiles

    def test_unflipped_victory_tiles_returns_empty_when_no_tiles(self):
        c = BingoCard(bingo_tiles=[])
        assert 0 == len(list(c.unflipped_victory_tiles()))

    def test_unflipped_victory_tiles_returns_empty_when_all_tiles_flipped(self):
        t = BingoTile(flipped=True, required_for_win=True)
        c = BingoCard(bingo_tiles=[t])
        assert 0 == len(list(c.unflipped_victory_tiles()))

    def test_unflipped_victory_tiles_returns_tile_when_required(self):
        t1 = BingoTile(flipped=True, required_for_win=False)
        t2 = BingoTile(flipped=False, required_for_win=True)
        c = BingoCard(bingo_tiles=[t2, t1])
        victory_tiles = list(c.unflipped_victory_tiles())
        assert 1 == len(victory_tiles)
        assert t2 in victory_tiles
        assert t1 not in victory_tiles

    def test_unfinished_returns_false_when_no_tiles(self):
        c = BingoCard(bingo_tiles=[])
        assert not c.unfinished()

    def test_unfinished_returns_false_when_all_tiles_flipped(self):
        t = BingoTile(flipped=True, required_for_win=False)
        c = BingoCard(bingo_tiles=[t])
        assert not c.unfinished()

        t = BingoTile(flipped=True, required_for_win=True)
        c = BingoCard(bingo_tiles=[t])
        assert not c.unfinished()

    def test_unfinished_returns_true_when_tile_unflipped(self):
        t = BingoTile(flipped=False, required_for_win=True)
        c = BingoCard(bingo_tiles=[t])
        assert c.unfinished()

    def test_finished_returns_true_when_no_tiles(self):
        c = BingoCard(bingo_tiles=[])
        assert c.finished()

    def test_finished_returns_true_when_all_tiles_flipped(self):
        t = BingoTile(flipped=True, required_for_win=False)
        c = BingoCard(bingo_tiles=[t])
        assert c.finished()

        t = BingoTile(flipped=True, required_for_win=True)
        c = BingoCard(bingo_tiles=[t])
        assert c.finished()

    def test_finished_returns_false_when_tile_unflipped(self):
        t = BingoTile(flipped=False, required_for_win=True)
        c = BingoCard(bingo_tiles=[t])
        assert not c.finished()

    def test_finished_at_returns_none_when_no_tiles(self):
        c = BingoCard(bingo_tiles=[])
        assert c.finished_at() is None

    def test_finished_at_returns_none_when_no_victory_tiles(self):
        t = BingoTile(flipped=True, required_for_win=False)
        c = BingoCard(bingo_tiles=[t])
        assert c.finished_at() is None

    def test_finished_at_returns_latest_timestamp_when_all_tiles_flipped(self):
        dt = datetime.datetime(
            year=2012,
            month=10,
            day=3,
            hour=11,
            minute=28,
            second=11,
            tzinfo=datetime.timezone.utc,
        )
        t = BingoTile(flipped=True, required_for_win=True, flipped_at=dt)
        c = BingoCard(bingo_tiles=[t])
        assert dt == c.finished_at() == dt

        dt1 = datetime.datetime(
            year=2012,
            month=10,
            day=3,
            hour=11,
            minute=28,
            second=11,
            tzinfo=datetime.timezone.utc,
        )
        t1 = BingoTile(flipped=True, required_for_win=True, flipped_at=dt1)
        dt2 = datetime.datetime(
            year=2013,
            month=10,
            day=3,
            hour=11,
            minute=28,
            second=11,
            tzinfo=datetime.timezone.utc,
        )
        t2 = BingoTile(flipped=True, required_for_win=True, flipped_at=dt2)
        c = BingoCard(bingo_tiles=[t1, t2])
        assert dt2 == c.finished_at()

    def test_finished_at_returns_none_when_tile_unflipped(self):
        t = BingoTile(flipped=False, required_for_win=True)
        c = BingoCard(bingo_tiles=[t])
        assert c.finished_at() is None

    def test_compute_total_amounts_for_resource_assigns_proportional_to_victory_tile_count(
        self, monkeypatch
    ):
        now = datetime.datetime.now(tz=datetime.timezone.utc)
        u = User()
        last_activity_dt = now - datetime.timedelta(hours=1)
        last_activity = UserActivity(
            created_at=last_activity_dt,
            steps=42,
            active_minutes=36,
            distance_km=decimal.Decimal(1.8),
        )
        monkeypatch.setattr(u, "last_activity", lambda: last_activity)

        def mock_latest_activity_for_days_within_timespan(
            start: datetime.datetime, end: datetime.datetime
        ) -> Generator[UserActivity, None, None]:
            yield last_activity

        monkeypatch.setattr(
            u,
            "latest_activity_for_days_within_timespan",
            mock_latest_activity_for_days_within_timespan,
        )

        card = BingoCard()
        start = now - datetime.timedelta(hours=2)
        pattern = SampleBingoCardPattern()
        totals = card.compute_total_amounts_for_resource(u, start, now, pattern)

        # 42 / (5/9)
        assert 75 == totals.steps

        # 36 / (5/9)
        assert 64 == totals.active_minutes

        # 1.8 / (5/9)
        assert decimal.Decimal("3.24") == totals.distance_km
