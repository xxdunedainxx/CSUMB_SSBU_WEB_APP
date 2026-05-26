# Represents all results in one object
from src.data.db.model import TaskSwitchingResult
from src.data.db.model.PosnerCueResult import PosnerCueResult
from src.data.db.model.SrtTestResult import SrtTestResult
from src.data.db.model.TestResult import TestResult
from src.data.db.model.GngTestResult import GngTestResult

class CompleteTestResults:

    def __init__(self,
        testResult: TestResult,
        GngTestResults: [GngTestResult],
        PosnerRecords: [PosnerCueResult],
        SrtRecords: [SrtTestResult],
        TaskSwitchingRecords: [TaskSwitchingResult],
    ):
        self.testResult = testResult
        self.gngTestResults = GngTestResults
        self.posner = PosnerRecords
        self.srt = SrtRecords
        self.taskSwitch = TaskSwitchingRecords

    def serialize(self) -> dict:

        gngRecords = []
        posnerRecords = []
        srtRecords=[]
        taskSwitchRecords=[]

        for gngRecord in self.gngTestResults:
            gngRecords.append(gngRecord.serialize())

        for pRecord in self.posner:
            posnerRecords.append(pRecord.serialize())


        for srtRecord in self.srt:
            srtRecords.append(srtRecord.serialize())

        for taskSwitchRecord in self.taskSwitch:
            taskSwitchRecords.append(taskSwitchRecord.serialize())

        return {
            "testResult" : self.testResult.serialize(),
            "gngRecords": gngRecords,
            "posnerRecords": posnerRecords,
            "srtRecords": srtRecords,
            "taskSwitchRecords": taskSwitchRecords
        }