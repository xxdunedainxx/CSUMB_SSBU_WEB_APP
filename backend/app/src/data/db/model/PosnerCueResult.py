"""
    Ref: https://www.psytoolkit.org/experiment-library/cueing.html
      1 - Test or training data
      2 - cue position (cueleft, cueright)
      3 - target position (targetleft, targetright)
      4 - cue validity (cued, uncued)
      5 - cued or uncued 
      6 - cue validity as number (1=cued, 0=uncued)
      7 - Response time (ms)
      8 - Status (1=correct, 2=wrong, 3=timeout)
"""
# Represents a single Posner cue test result data object
class PosnerCueResult:

    def __init__(self,
                 id: int,
                 testResultId: int,
                 TestOrTraining: str,
                 CuePosition: str, 
                 TargetPosition: str, 
                 CueValidity: str, 
                 CuedOrUncued: str, 
                 CueValidityAsNumber: str, 
                 ResponseTimeMs: int,
                 ResponseStatus: int
    ):
        self.id: int = id
        self.testResultId: int = testResultId
        self.TestOrTraining: str = TestOrTraining
        self.CuePosition: str = CuePosition
        self.TargetPosition: str = TargetPosition
        self.CueValidity: str = CueValidity
        self.CuedOrUncued: str = CuedOrUncued
        self.CueValidityAsNumber: str = CueValidityAsNumber
        self.ResponseTimeMs: int = ResponseTimeMs
        self.ResponseStatus: int = ResponseStatus

    def serialize(self) -> dict:
        return {
            "id": self.id,
            "testResultId": self.testResultId,
            "TestOrTraining": self.TestOrTraining,
            "CuePosition": self.CuePosition,
            "TargetPosition": self.TargetPosition,
            "CueValidity": self.CueValidity,
            "CuedOrUncued": self.CuedOrUncued,
            "CueValidityAsNumber": self.CueValidityAsNumber,
            "ResponseTimeMs": self.ResponseTimeMs,
            "ResponseStatus": self.ResponseStatus,

        }

    """
        Creates a new Gng Test result from a json dictionary provided 
    """
    @staticmethod
    def deserialize_to_object(json: dict):
        return PosnerCueResult(
            id=json["id"],
            testResultId=json["testResultId"],
            TestOrTraining=json["TestOrTraining"],
            CuePosition=json["CuePosition"],
            TargetPosition=json["TargetPosition"],
            CueValidity=json["CueValidity"],
            CuedOrUncued=json["CuedOrUncued"],
            CueValidityAsNumber=json["CueValidityAsNumber"],
            ResponseTimeMs=json["ResponseTimeMs"],
            ResponseStatus=json["ResponseStatus"]
        )