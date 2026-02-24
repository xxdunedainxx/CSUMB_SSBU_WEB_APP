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
         whenGeneerated: datetime,
         classification: str
    ):
        self.id = id
        self.userId= userId
        self.whenGenerated=whenGeneerated
        self.classification=classification