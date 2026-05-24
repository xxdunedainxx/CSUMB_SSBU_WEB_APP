"""
    Ref: https://www.psytoolkit.org/experiment-library/deary_liewald.html
    1 - Test or trials 
    2 - training (1=training, 0=real data collection)
    3 - number of choices (1 in simple block, 4 in choice block)
    4 - time between response and next trial (between 1 and 3 seconds)
    5 - the x-coordinate of the target stimulus
    6 - the response time (ms)
    7 - status (1=correct, 2=error, 3=too slow)
"""
class SrtTestResult:

    def __init__(self,
                 id: int,
                 testResultId: int,
                 TestOrTraining: str,
                 TrainingOrReal: str,
                 NumberOfChoices: int,
                 timeBetweenResponseAndNextTrial: int,
                 XCoordinateTargetStim: int,
                 ResponseTimeMs: int,
                 StatusOfAnswer: int
    ):
        self.id: int = id
        self.testResultId: int = testResultId
        self.TestOrTraining: str = TestOrTraining
        self.TrainingOrReal: str = TrainingOrReal
        self.timeBetweenResponseAndNextTrial: int = timeBetweenResponseAndNextTrial
        self.XCoordinateTargetStim: int = XCoordinateTargetStim
        self.ResponseTimeMs: int = ResponseTimeMs
        self.StatusOfAnswer: int = StatusOfAnswer
        self.NumberOfChoices: int = NumberOfChoices

    def serialize(self) -> dict:
        return {
            "id": self.id,
            "testResultId": self.testResultId,
            "TestOrTraining": self.TestOrTraining,
            "TrainingOrReal": self.TrainingOrReal,
            "timeBetweenResponseAndNextTrial": self.timeBetweenResponseAndNextTrial,
            "XCoordinateTargetStim": self.XCoordinateTargetStim,
            "ResponseTimeMs": self.ResponseTimeMs,
            "StatusOfAnswer": self.StatusOfAnswer,
            "NumberOfChoices": self.NumberOfChoices,
        }

    """
        Creates a new Gng Test result from a json dictionary provided 
    """
    @staticmethod
    def deserialize_to_object(json: dict):
        return SrtTestResult(
            id=json["id"],
            testResultId=json["testResultId"],
            TestOrTraining=json["TestOrTraining"],
            TrainingOrReal=json["TrainingOrReal"],
            timeBetweenResponseAndNextTrial=json["timeBetweenResponseAndNextTrial"],
            XCoordinateTargetStim=json["XCoordinateTargetStim"],
            ResponseTimeMs=json["ResponseTimeMs"],
            StatusOfAnswer=json["StatusOfAnswer"],
            NumberOfChoices=json["NumberOfChoices"]
        )