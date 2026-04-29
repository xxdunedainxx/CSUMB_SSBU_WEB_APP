"""
    Author: Zach McFadden
    Date: 2/24/26
    Synopsis: Basic Test Result model

    Model Reference:
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        userID INT REFERENCES userTable(id),
        whenGenerated TIMESTAMPTZ,
        classification VARCHAR(100), -- Unclassified data could be queried by the ML Model?
"""
import datetime

class TestResult:
    def __init__(self,
         id: int,
         userId: int,
         whenGenerated: datetime,
         classification: str
    ):
        self.id = id
        self.userId= userId
        self.whenGenerated=whenGenerated
        self.classification=classification

    def serialize(self) -> dict:
        return {
            "id": self.id,
            "userId": self.userId,
            "whenGenerated": self.whenGenerated,
            "classification": self.classification
        }

    """
        Creates a new Gng Test result from a json dictionary provided 
    """
    @staticmethod
    def deserialize_to_object(json: dict):
        return TestResult(
            id=json["id"],
            userId=json["userId"],
            whenGenerated=json["whenGenerated"],
            classification=json["classification"]
        )