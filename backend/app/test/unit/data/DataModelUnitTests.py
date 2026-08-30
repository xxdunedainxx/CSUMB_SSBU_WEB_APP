"""
    Author: Zach McFadden
    Date: 04.16.26
    Synopsis: Unit tests for data models
"""
from src.data.db.model.GngTestResult import GngTestResult
from src.data.db.model.SrtTestResult import SrtTestResult
from src.util.LogFactory import LogFactory
from src.sec.DataValidation import DataModelValidation

from test.util.decorators.Toggle import enabled

import unittest

@enabled
def data_model_unit_tests():
    LogFactory.MAIN_LOG.info(f"RUNNING Data Model unit testing")
    unittest.main(module=__name__, exit=False)

class DataModelUnitTests(unittest.TestCase):

    @enabled
    def test_gng_test_result_model(self):
        # First test Object --> JSON
        obj = GngTestResult(
            id=1,
            testResultId=1,
            GoNoGoAndTestOrTrial="Test",
            ResponseTimeMs=1000,
            ErrorStatus=1
        )
        jsonObj=obj.serialize()

        assert(jsonObj["id"] == 1)
        assert(jsonObj["GoNoGoAndTestOrTrial"] == "Test")

        backToObject=GngTestResult.deserialize_to_object(jsonObj)

        assert(obj.id == backToObject.id)
        assert(obj.GoNoGoAndTestOrTrial == backToObject.GoNoGoAndTestOrTrial)

    @enabled
    def test_srt_result_model(self):
        srt = SrtTestResult(
            id=1,
            testResultId=1,
            TestOrTraining="dlsimple_training",
            TrainingOrReal=1,
            NumberOfChoices=1,
            TimeBetweenResponseAndNextTrial=1361,
            XCoordinateTargetStim=0,
            ResponseTimeMs=466,
            StatusOfAnswer=1
        )
        falseSrt = SrtTestResult(
            id=1,
            testResultId="1",
            TestOrTraining="dlsimple_training",
            TrainingOrReal=3,
            NumberOfChoices=3,
            TimeBetweenResponseAndNextTrial=9,
            XCoordinateTargetStim=2,
            ResponseTimeMs=9,
            StatusOfAnswer=9
        )

        assert (DataModelValidation.validate_srt_structure(srt))



if __name__ == "__main__":
    unittest.main()
LogFactory.main_log()