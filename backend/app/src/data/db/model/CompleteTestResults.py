# Represents all results in one object
from src.data.db.model.PosnerCueResult import PosnerCueResult
from src.data.db.model.TestResult import TestResult
from src.data.db.model.GngTestResult import GngTestResult

class CompleteTestResults:

    def __init__(self,
        testResult: TestResult,
        GngTestResults: [GngTestResult],
        PosnerRecords: [PosnerCueResult]
    ):
        self.testResult = testResult
        self.gngTestResults = GngTestResults
        self.posner = PosnerRecords

    def serialize(self) -> dict:

        gngRecords = []
        posnerRecords = []

        for gngRecord in self.gngTestResults:
            gngRecords.append(gngRecord.serialize())

        for pRecord in self.posner:
            posnerRecords.append(pRecord.serialize())

        return {
            "testResult" : self.testResult.serialize(),
            "gngRecords": gngRecords,
            "posnerRecords": posnerRecords
        }