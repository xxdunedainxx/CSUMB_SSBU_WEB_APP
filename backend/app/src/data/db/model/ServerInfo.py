"""
    Author: Zach McFadden
    Date: 7/25/26
    Synopsis: Server Information

    CREATE TABLE IF NOT EXISTS serverInfo (
        id INT PRIMARY KEY,
        lastMetricsUpdate TIMESTAMPTZ
    );
"""
import datetime

class ServerInfo:

    def __init__(self,
                 id: int,
                 lastMetricsUpdate: datetime.datetime,
    ):
        self.id = id
        self.lastMetricsUpdate=lastMetricsUpdate

    def serialize(self) -> dict:
        return {
            "id": self.id,
            "lastUpdate": self.lastMetricsUpdate,
        }

    @staticmethod
    def deserialize_to_object(json: dict):
        return ServerInfo(
            id=int(json['id']),
            lastMetricsUpdate=datetime.datetime(json['lastMetricsUpdate']),
        )