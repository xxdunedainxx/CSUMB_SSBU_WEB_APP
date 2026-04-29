"""
  Author: Zach McFadden
  Date: 4/24/2026
  Synopsis: Trial controller for fetching & updating trial records
"""
from src.Services import Services
from src.data.db.model.GngTestResult import GngTestResult
from src.util.LogFactory import LogFactory
from src.WebServer.decorators.HTTPLogger import http_logger
from src.WebServer.WebServerInit import WebServerInit
from src.util.ErrorFactory import errorStackTrace

from flask import Flask, request

flask_ref: Flask = WebServerInit.flask

class TrialController:

    def __init__(self):
        LogFactory.MAIN_LOG.info('Start TestController')
        TrialController.dbQueryFactory = Services.dbQueryFactory

    """
    Example Curl: 
      curl localhost:80/create_new_test_result_entry -XPOST -d '{"userId":1, "classification":"gngOnly"}' -H "Content-Type: application/json"
    """
    @staticmethod
    @flask_ref.route('/create_new_test_result_entry', methods=['POST'])
    @http_logger
    def create_new_test_result_entry():
        try:
            userId = request.json["userId"]
            classification = request.json["classification"]

            LogFactory.MAIN_LOG.info(f"Creating new test result entry for user {userId}")

            record = Services.dbQueryFactory.create_new_test_result_non_structured(
                userId=userId,
                classification=classification
            )

            return record.serialize(), 200

        except Exception as e:
            LogFactory.MAIN_LOG.error(f"Failed to create new test result entry {errorStackTrace(e)}")
            return {
                "response": "sadness"
            }, 500

    """
    EXAMPLE CURL: 
    
    curl localhost:80/upload_gng_test_results -XPOST -H "Content-Type: application/json" -d '{"gngTestResults": [
      {"id": 1, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 320, "ErrorStatus": 0},
      {"id": 2, "testResultId": 1, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 1},
      {"id": 3, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 290, "ErrorStatus": 0},
      {"id": 4, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 410, "ErrorStatus": 0},
      {"id": 5, "testResultId": 1, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 0},
    
      {"id": 6, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 275, "ErrorStatus": 0},
      {"id": 7, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 350, "ErrorStatus": 1},
      {"id": 8, "testResultId": 1, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 0},
      {"id": 9, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 305, "ErrorStatus": 0},
      {"id": 10, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 330, "ErrorStatus": 0},
    
      {"id": 11, "testResultId": 1, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 1},
      {"id": 12, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 295, "ErrorStatus": 0},
      {"id": 13, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 360, "ErrorStatus": 0},
      {"id": 14, "testResultId": 1, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 0},
      {"id": 15, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 280, "ErrorStatus": 1},
    
      {"id": 16, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 310, "ErrorStatus": 0},
      {"id": 17, "testResultId": 1, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 0},
      {"id": 18, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 345, "ErrorStatus": 0},
      {"id": 19, "testResultId": 1, "GoNoGoAndTestOrTrial": "GO", "ResponseTimeMs": 390, "ErrorStatus": 1},
      {"id": 20, "testResultId": 1, "GoNoGoAndTestOrTrial": "NOGO", "ResponseTimeMs": 0, "ErrorStatus": 0}
    ]}'
    """
    @staticmethod
    @flask_ref.route('/upload_gng_test_results', methods=['POST'])
    @http_logger
    def upload_gng_test_results():
        try:
            LogFactory.MAIN_LOG.info("Processing Gng Test Results")

            results = request.json["gngTestResults"]

            for result in results:
                Services.dbQueryFactory.insert_gng_test_result(
                    GngTestResult.deserialize_to_object(result)
                )

            return {
                "response": "records uploaded"
            }, 200
        except Exception as e:
            LogFactory.MAIN_LOG.error(f"Upload gng test results {errorStackTrace(e)}")
            return {
                "response": "sadness"
            }, 500

    """
        Example Curl: curl localhost:80/get_test_result_data/1/1
    """
    @staticmethod
    @flask_ref.route('/get_test_result_data/<int:userId>/<int:testId>', methods=['GET'])
    @http_logger
    def get_test_result_data(userId: int, testId: int):
        try:
            LogFactory.MAIN_LOG.info("Fetching test result data")

            return Services.dbQueryFactory \
                .get_test_results(testId=testId,userId=userId) \
                .serialize(), 200

        except Exception as e:
            LogFactory.MAIN_LOG.error(f"Failed fetching test result data {errorStackTrace(e)}")
            return {
                "response": "sadness"
            }, 500

    """
        Example curl: curl localhost:80/get_all_test_ids/1
    """
    @staticmethod
    @flask_ref.route('/get_all_test_ids/<int:userId>', methods=['GET'])
    @http_logger
    def get_user_test_results(userId: int):
        try:
            LogFactory.MAIN_LOG.info("Fetching user test IDs")

            return {"testIds": Services.dbQueryFactory.get_all_user_test_result_ids(userId=userId)}, 200

        except Exception as e:
            LogFactory.MAIN_LOG.error(f"Failed user test IDs {errorStackTrace(e)}")
            return {
                "response": "sadness"
            }, 500

