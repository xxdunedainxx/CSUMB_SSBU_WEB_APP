"""
      1 - letter | numbers | mixed and TestOrTrial
      2 - position of stimulus 1,2,3,4 (top left, top right, bottom right, bottom left
      3 - tasktype (1 or 2)
      4 - the letter stimulus
      5 - the number stimulus
      6 - type of block (1=just task 1; 2=just task 2; 0=both tasks mixed)
      7 - 1=task switch , 0=task repeat
      8 - status (1=correct, 2=error, 3=too slow)
      9 - response time (ms)
      10 - total time (response time + button release time)
"""
class TaskSwitchingResults:

    def __init__(self,
                 id: int,
                 testResultId: int,
                 TaskSwitchTypeAndTestOrTrial: str,
                 position: int,
                 taskType: int,
                 numberStimulus: int,
                 letterStimulus: str,
                 typeOfBlock: int,
                 taskSwitchOrTaskRepeat: int,
                 status: int,
                 ResponseTimeMs: int,
                 totalTimeMs: int
    ):
        self.id: int = id
        self.testResultId=testResultId
        self.TaskSwitchTypeAndTestOrTrial: str = TaskSwitchTypeAndTestOrTrial
        self.position: int = position
        self.taskType: int = taskType
        self.letterStimulus: str = letterStimulus
        self.numberStimulus: int = numberStimulus
        self.typeOfBlock: int = typeOfBlock
        self.taskSwitchOrTaskRepeat: int = taskSwitchOrTaskRepeat
        self.status: int = status
        self.ResponseTimeMs: int = ResponseTimeMs
        self.totalTimeMs: int = totalTimeMs


    def serialize(self) -> dict:
        return {
            "id": self.id,
            "testResultId": self.testResultId,
            "TaskSwitchTypeAndTestOrTrial": self.TaskSwitchTypeAndTestOrTrial,
            "position": self.position,
            "taskType": self.taskType,
            "letterStimulus": self.letterStimulus,
            "numberStimulus": self.numberStimulus,
            "typeOfBlock": self.typeOfBlock,
            "taskSwitchOrTaskRepeat": self.taskSwitchOrTaskRepeat,
            "status": self.status,
            "ResponseTimeMs": self.ResponseTimeMs,
            "totalTimeMs": self.totalTimeMs

        }

    """
        Creates a new Gng Test result from a json dictionary provided 
    """
    @staticmethod
    def deserialize_to_object(json: dict):
        return SrtTestResult(
            id=json["id"],
            testResultId=json["testResultId"],
            TaskSwitchTypeAndTestOrTrial=json["TaskSwitchTypeAndTestOrTrial"],
            position=json["position"],
            taskType=json["taskType"],
            letterStimulus=json["letterStimulus"],
            numberStimulus=json["numberStimulus"],
            typeOfBlock=json["typeOfBlock"],
            taskSwitchOrTaskRepeat=json["taskSwitchOrTaskRepeat"],
            status=json["status"],
            ResponseTimeMs = json["ResponseTimeMs"],
            totalTimeMs=json["totalTimeMs"]
        )