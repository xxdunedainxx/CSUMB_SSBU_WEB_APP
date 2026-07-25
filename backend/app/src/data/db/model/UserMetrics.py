"""
    Author: Zach McFadden
    Date: 7/25/26
    Synopsis: User Related Metrics

    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    userID INT REFERENCES userTable(id),
    lastUpdate TIMESTAMPTZ,
    -- Encrypted metrics data, most likely a json blob
    payload BYTEA NOT NULL
"""
import datetime

class UserMetrics:

    def __init__(self,
                 id: int,
                 userId: int,
                 lastUpdate: datetime.datetime,
                 payload: dict
    ):
        self.id = id
        self.userId=userId
        self.lastUpdate=lastUpdate
        self.payload=payload

    def serialize(self) -> dict:
        return {
            "id": self.id,
            "userId": self.userId,
            "lastUpdate": self.lastUpdate,
            "payload": self.payload
        }

    @staticmethod
    def deserialize_to_object(json: dict):
        return UserMetrics(
            id=int(json['id']),
            userId=int(json['userId']),
            lastUpdate=datetime.datetime(json['lastUpdate']),
            payload=json['payload']
        )