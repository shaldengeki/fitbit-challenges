from flask import abort, request
from graphql_server.flask import GraphQLView
from .config import app, verify_fitbit_signature, verify_fitbit_verification
from . import models

from . import gql

app.add_url_rule(
    "/graphql",
    view_func=GraphQLView.as_view("graphql", schema=gql.Schema(models), graphiql=True),
)


@app.route("/fitbit-notifications", methods=["GET"])
def fitbit_verification():
    if not request.args.get("verify", False):
        abort(404)

    if verify_fitbit_verification(request.args["verify"]):
        return "yay", 204
    else:
        abort(404)


@app.route("/fitbit-notifications", methods=["POST"])
def fitbit_notifications():
    if not verify_fitbit_signature(
        request.headers.get("X-Fitbit-Signature", ""), request.get_data()
    ):
        abort(400)

    return "yay!"
