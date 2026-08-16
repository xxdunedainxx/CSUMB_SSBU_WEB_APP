class ControllerTestResult:

    def __init__(
        self,
        id: int,
        testResultId: int,
        resultType: str,
        payload: dict,
    ):
        self.id: int = id
        self.testResultId: int = testResultId
        self.resultType: str = resultType
        self.payload: dict = payload

    def serialize(self) -> dict:
        return {
            "id": self.id,
            "testResultId": self.testResultId,
            "resultType": self.resultType,
            "payload": self.payload,
        }

    @staticmethod
    def deserialize_to_object(json: dict):
        return ControllerTestResult(
            id=json["id"],
            testResultId=json["testResultId"],
            resultType=json["resultType"],
            payload=json["payload"],
        )
