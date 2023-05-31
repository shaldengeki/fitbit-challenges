import dataclasses
import requests
import secrets

from base64 import b64encode
from hashlib import sha256
from typing import Optional
from urllib.parse import urlencode


@dataclasses.dataclass
class FitbitClient:
    client_id: str
    client_secret: str
    collections: list[str] = dataclasses.field(
        default_factory=lambda: ["activity", "heartrate", "profile", "social"]
    )

    def create_code_verifier() -> str:
        return secrets.token_hex()

    @property
    def authorization_token(self) -> str:
        return b64encode(f"{self.client_id}:{self.client_secret}".encode("utf-8"))

    def get_token_data(
        self, authorization_code: str, code_verifier: str
    ) -> Optional[dict]:
        url_parameters = urlencode(
            {
                "client_id": self.client_id,
                "code": authorization_code,
                "code_verifier": code_verifier,
                "grant_type": "authorization_code",
            }
        )

        auth_request = requests.post(
            url="https://api.fitbit.com/oauth2/token?" + url_parameters,
            headers={
                "Authorization": f"Basic {self.authorization_token}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data=url_parameters,
        )

        if auth_request.status_code != 200:
            return None

        return auth_request.json()

    @staticmethod
    def code_challenge_from_verifier(code_verifier: str) -> str:
        return (
            b64encode(sha256(code_verifier.encode("utf-8")).digest())
            .decode("utf-8")
            .rstrip("=")
            .replace("+", "-")
            .replace("/", "_")
        )

    def authorization_url(self, code_verifier: str) -> str:
        url_parameters = {
            "client_id": self.client_id,
            "response_type": "code",
            "code_challenge": self.code_challenge_from_verifier(code_verifier),
            "code_challenge_method": "S256",
            "scope": " ".join(self.collections),
        }
        return "https:///www.fitbit.com/oauth2/authorize?" + urlencode(url_parameters)
