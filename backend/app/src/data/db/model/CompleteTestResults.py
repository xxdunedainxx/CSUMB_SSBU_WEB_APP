# Represents all results in one object
from src.data.db.model.TestResult import TestResult
from src.data.db.model.GngTestResult import GngTestResult

class CompleteTestResults:

    def __init__(self,
        testResult: TestResult,
        GngTestResults: [GngTestResult]
    ):
        self.testResult = testResult
        self.gngTestResults = GngTestResults

    def serialize(self) -> dict:

        gngRecords = []

        for gngRecord in self.gngTestResults:
            gngRecords.append(gngRecord.serialize())

        return {
            "testResult" : self.testResult.serialize(),
            "gngRecords": gngRecords
        }