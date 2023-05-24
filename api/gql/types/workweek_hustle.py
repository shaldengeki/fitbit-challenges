import datetime
from graphql import (
    GraphQLArgument,
    GraphQLField,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
)
from typing import Any, Type

from ...config import db
from .challenge import Challenge, ChallengeType, challenge_type


def create_workweek_hustle(
    challenge_model: Type[Challenge], args: dict[str, Any]
) -> Challenge:
    # Round to nearest hour.
    startAt = int(int(args["startAt"]) / 3600) * 3600

    # Five days after starting.
    endAt = startAt + 5 * 24 * 60 * 60

    challenge = challenge_model(
        challenge_type=ChallengeType.WORKWEEK_HUSTLE.value,
        users=",".join(args["users"]),
        start_at=datetime.datetime.utcfromtimestamp(startAt),
        end_at=datetime.datetime.utcfromtimestamp(endAt),
    )
    db.session.add(challenge)
    db.session.commit()
    return challenge


def create_workweek_hustle_field(
    challenge_model: Type[Challenge],
) -> GraphQLField:
    return GraphQLField(
        challenge_type,
        description="Create a Workweek Hustle challenge.",
        args={
            "users": GraphQLArgument(
                GraphQLList(GraphQLString),
                description="List of usernames participating in the challenge.",
            ),
            "startAt": GraphQLArgument(
                GraphQLNonNull(GraphQLInt),
                description="Time the challenge should start, in unix epoch time.",
            ),
        },
        resolve=lambda root, info, **args: create_workweek_hustle(
            challenge_model, args
        ),
    )
