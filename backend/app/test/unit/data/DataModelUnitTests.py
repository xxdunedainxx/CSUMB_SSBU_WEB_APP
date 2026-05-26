"""
    Author: Zach McFadden
    Date: 04.16.26
    Synopsis: Unit tests for data models
"""
from src.data.db.model.GngTestResult import GngTestResult
from src.util.LogFactory import LogFactory

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



if __name__ == "__main__":
    unittest.main()
