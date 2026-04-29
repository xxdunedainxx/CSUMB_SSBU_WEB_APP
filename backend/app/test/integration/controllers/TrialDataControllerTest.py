"""
  Author: Zach McFadden
  Date: 4/28/26
  Synopsis: Int testing for test result processing web services
"""
from src.data.db.model.TestResult import TestResult
from src.util.LogFactory import LogFactory
from test.util.decorators.Toggle import enabled
import requests
import unittest

@enabled
def trial_data_controller_tests():
    LogFactory.MAIN_LOG.info(f"RUNNING TestController integration tests")
    unittest.main(module=__name__, exit=False)


class TrialDataControllerTests(unittest.TestCase):

    @enabled
    def test_create_test_result_entry(self):
        testResultData = requests.post(
            "http://localhost:80/create_new_test_result_entry",
            headers={"Content-Type": "application/json"},
            json={"userId":1, "classification":"gngOnly"}
        )
        assert(testResultData.status_code == 200)

        dataStructured=TestResult.deserialize_to_object(
            testResultData.json()
        )

        assert(dataStructured.userId == 1)
        assert(dataStructured.classification == "gngOnly")

        allTestResults=requests.get(
            "http://localhost:80/get_all_test_ids/1",
            headers={"Content-Type": "application/json"}
        )

        # Ensure its in the following list of ALL test ids
        assert(allTestResults.status_code == 200)
        assert(dataStructured.id in allTestResults.json()["testIds"])

    @enabled
    def test_upload_gng_test_results(self):
        testResultData = requests.post(
            "http://localhost:80/create_new_test_result_entry",
            headers={"Content-Type": "application/json"},
            json={"userId":1, "classification":"gngOnly"}
        )
        assert(testResultData.status_code == 200)

        dataStructured=TestResult.deserialize_to_object(
            testResultData.json()
        )

        gngRequestResult = requests.post(
            "http://localhost:80/upload_gng_test_results",
            headers={"Content-Type": "application/json"},
            json={"gngTestResults": [
              {"id": 1, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 320, "ErrorStatus": 0},
              {"id": 2, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 1},
              {"id": 3, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 290, "ErrorStatus": 0},
              {"id": 4, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 410, "ErrorStatus": 0},
              {"id": 5, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 0},
              {"id": 6, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 275, "ErrorStatus": 0},
              {"id": 7, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 350, "ErrorStatus": 1},
              {"id": 8, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 0},
              {"id": 9, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 305, "ErrorStatus": 0},
              {"id": 10, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 330, "ErrorStatus": 0},
              {"id": 11, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 1},
              {"id": 12, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 295, "ErrorStatus": 0},
              {"id": 13, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 360, "ErrorStatus": 0},
              {"id": 14, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 0},
              {"id": 15, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 280, "ErrorStatus": 1},
              {"id": 16, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 310, "ErrorStatus": 0},
              {"id": 17, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 0},
              {"id": 18, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 345, "ErrorStatus": 0},
              {"id": 19, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 390, "ErrorStatus": 1},
              {"id": 20, "testResultId": dataStructured.id, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 0}
            ]}
        )

        assert(gngRequestResult.status_code == 200)

        # Test fetching the Gng results
        resultData=requests.get(f"http://localhost:80/get_test_result_data/1/{dataStructured.id}")

        assert(resultData.status_code == 200)
        assert(len(resultData.json()["gngRecords"]) == 20)