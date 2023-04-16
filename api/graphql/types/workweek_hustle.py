import datetime
from graphql import (
    GraphQLArgument,
    GraphQLObjectType,
    GraphQLField,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
)
from sqlalchemy import desc

from ...config import db


def workweek_hustle_resolver():
    return {
        "id": GraphQLField(
            GraphQLNonNull(GraphQLInt), description="The id of the Workweek Hustle challenge."
        ),
        "users": GraphQLField(
            GraphQLNonNull(GraphQLString), description="The users participating in the challenge, as a comma-separated string."
        ),
        "createdAt": GraphQLField(
            GraphQLNonNull(GraphQLInt),
            description="The date that the Workweek Hustle was created, in unix epoch time.",
            resolve=lambda server, info, **args: int(server.created_at.timestamp()),
        ),
        "startAt": GraphQLField(
            GraphQLNonNull(GraphQLInt),
            description="The start datetime of the challenge, in unix epoch time.",
            resolve=lambda server, info, **args: int(server.start_at.timestamp()),
        ),
        "endAt": GraphQLField(
            GraphQLNonNull(GraphQLInt),
            description="The end datetime of the challenge, in unix epoch time.",
            resolve=lambda server, info, **args: int(server.end_at.timestamp()),
        ),
    }


workweek_hustle_type = GraphQLObjectType(
    "WorkweekHustle",
    description="A Workweek Hustle challenge.",
    fields=workweek_hustle_resolver,
)


def fetch_workweek_hustles(models, params):
    query_obj = models.WorkweekHustle.query
    return query_obj.order_by(desc(models.WorkweekHustle.start_at)).all()

def challenges_field(models):
    return GraphQLField(
        GraphQLList(workweek_hustle_type),
        resolve=lambda root, info, **args: fetch_workweek_hustles(models, args),
    )