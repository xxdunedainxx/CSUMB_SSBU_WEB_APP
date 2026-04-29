"""
  Author: Zach McFadden
  Date: 2/24/26
  Synopsis: Int testing for DB Query Factory
"""
from src.data.db.DBConnector import DBConnector
from src.data.db.DbQueryFactory import DbQueryFactory
from src.data.db.model.GngTestResult import GngTestResult
from src.data.db.model.TestResult import TestResult
from src.data.db.model.User import User
from src.util.LogFactory import LogFactory
from test.util.decorators.Toggle import enabled

import unittest

@enabled
def db_query_factory_tests():
    LogFactory.MAIN_LOG.info(f"RUNNING DB query factory tests")
    unittest.main(module=__name__, exit=False)

class DBConnectorTests(unittest.TestCase):


    @enabled
    def test_create_new_user_and_fetch(self):
        dbConnector = DBConnector(
            "localhost",
            "csumb_webapp",
            "postgres",
            "my-secret-pw",
            5432
        )

        dbQueryFactory = DbQueryFactory(dbConnector)

        emailToUse="someEmail@gmail.com"
        dbQueryFactory.create_new_user(
            User(
                id=-1,
                email=emailToUse,
                password="blah",
                salt="blah",
                verified=False,
                whenCreated=None,
                lastLogin=None
            )
        )

        # Fetch the user
        newUserRecord = dbQueryFactory.fetch_user_by_email(email=emailToUse)

        assert(newUserRecord.email == emailToUse)
        assert(newUserRecord.verified == False)
        assert(newUserRecord.salt=="blah")

    @enabled
    def test_create_test_result(self):
        dbConnector = DBConnector(
            "localhost",
            "csumb_webapp",
            "postgres",
            "my-secret-pw",
            5432
        )

        dbQueryFactory = DbQueryFactory(dbConnector)

        res=dbQueryFactory.create_new_test_result(
            TestResult(
                0,
                1,
                None,
                "RandomClassification"
            )
        )

        assert(res[0][1] == 1)


    @enabled
    def test_create_gng_results(self):
        dbConnector = DBConnector(
            "localhost",
            "csumb_webapp",
            "postgres",
            "my-secret-pw",
            5432
        )

        dbQueryFactory = DbQueryFactory(dbConnector)

        dbQueryFactory.create_new_user(
            User(
                id=-1,
                email="zachsCoolEmail@gmail.com",
                password="blah",
                salt="blah",
                verified=False,
                whenCreated=None,
                lastLogin=None
            )
        )

        testResult=dbQueryFactory.create_new_test_result(
            TestResult(
                0,
                1,
                None,
                "RandomClassification"
            )
        )

        dbQueryFactory.insert_gng_test_result(
            gngTestResult=GngTestResult(
                id=0,
                testResultId=testResult[0][1],
                GoNoGoAndTestOrTrial="Test",
                ResponseTimeMs=1000,
                ErrorStatus=1
            )
        )

        result=dbQueryFactory.get_gng_test_results(testId=testResult[0][1])

        assert(result[0].GoNoGoAndTestOrTrial == "Test")
