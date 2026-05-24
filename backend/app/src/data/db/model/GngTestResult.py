# Represents a single Gng Test result data object
class GngTestResult:

    def __init__(self,
                 id: int,
                 testResultId: int,
                 GoNoGoAndTestOrTrial: str,
                 ResponseTimeMs: int,
                 ErrorStatus: int
    ):
        self.id: int = id
        self.testResultId: int = testResultId
        self.GoNoGoAndTestOrTrial: str = GoNoGoAndTestOrTrial
        self.ResponseTimeMs: int = ResponseTimeMs
        self.ErrorStatus: int = ErrorStatus

    def serialize(self) -> dict:
        return {
            "id": self.id,
            "testResultId": self.testResultId,
            "GoNoGoAndTestOrTrial": self.GoNoGoAndTestOrTrial,
            "ResponseTimeMs": self.ResponseTimeMs,
            "ErrorStatus": self.ErrorStatus
        }

    """
        Creates a new Gng Test result from a json dictionary provided 
    """
    @staticmethod
    def deserialize_to_object(json: dict):
        return GngTestResult(
            id=json["id"],
            testResultId=json["testResultId"],
            GoNoGoAndTestOrTrial=json["GoNoGoAndTestOrTrial"],
            ResponseTimeMs=json["ResponseTimeMs"],
            ErrorStatus=json["ErrorStatus"]
        )