import base64
import hmac
import hashlib
import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

app = Flask(__name__)
app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "postgresql://{user}:{password}@{host}/{db}".format(
    user=os.getenv("DB_USERNAME", "admin"),
    password=os.getenv("DB_PASSWORD", "development"),
    host=os.getenv("DB_HOST", "pg"),
    db=os.getenv("DATABASE_NAME", "api_development"),
)

app.config["FITBIT_SIGNING_KEY"] = os.getenv("FITBIT_CLIENT_SECRET", "testing") + "&"


def verify_fitbit_signature(header_signature: str, json_body: bytes):
    digest = hmac.digest(
        app.config["FITBIT_SIGNING_KEY"].encode("utf-8"), json_body, hashlib.sha1
    )
    b64_encoded = base64.b64encode(digest)
    return header_signature.encode("utf-8") == b64_encoded


cors_origin_parts = [
    os.getenv("FRONTEND_PROTOCOL", "http"),
    "://",
    os.getenv("FRONTEND_HOST", "localhost"),
]
if os.getenv("FRONTEND_PORT", None):
    cors_origin_parts.append(":" + os.getenv("FRONTEND_PORT", "5001"))

cors_origin = "".join(cors_origin_parts)

CORS(
    app,
    resources={
        "/graphql": {
            "origins": [cors_origin],
        }
    },
)

db = SQLAlchemy(app)

migrate = Migrate(app, db)
