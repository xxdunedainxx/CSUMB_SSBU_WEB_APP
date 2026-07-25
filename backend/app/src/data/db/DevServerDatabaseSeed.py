"""
  Author: Zach McFadden
  Date: 7/25/26
  Synopsis: Util class for seeding trial data into the DB on server startup
"""
from src.Configuration import CONF_INSTANCE
from src.util.LogFactory import LogFactory
from src.Services import Services
from src.data.db.model.TestResult import TestResult
from src.data.db.model.SrtTestResult import SrtTestResult
from src.data.db.model.GngTestResult import GngTestResult
from src.data.db.model.PosnerCueResult import PosnerCueResult
import random


class DevServerDatabaseSeed:

    TEST_ACCOUNT_ID=1

    @staticmethod
    def create_random_srt_result(testResult: TestResult, testOrTrain: str) -> SrtTestResult:
        """
        dlsimple_training,1,1,2312,0,199,1
             id: int,
             testResultId: int,
             TestOrTraining: str,
             TrainingOrReal: int,
             NumberOfChoices: int,
             TimeBetweenResponseAndNextTrial: int,
             XCoordinateTargetStim: int,
             ResponseTimeMs: int,
             StatusOfAnswer: int
        """
        trainOrReal=1
        if testOrTrain == "dlsimple_real":
            trainOrReal=0
        return SrtTestResult(
            id=0,
            testResultId=testResult.id,
            TestOrTraining=testOrTrain,
            TrainingOrReal=trainOrReal,
            NumberOfChoices=1,
            TimeBetweenResponseAndNextTrial=random.randint(1000,3000),
            XCoordinateTargetStim=0,
            ResponseTimeMs=random.randint(150,300),
            StatusOfAnswer=1
        )

    @staticmethod
    def create_random_gng_result(testResult: TestResult, goOrNoGo: str) -> GngTestResult:
        return GngTestResult(
            id=0,
            testResultId=testResult.id,
            GoNoGoAndTestOrTrial=goOrNoGo,
            ResponseTimeMs=random.randint(100, 1000),
            ErrorStatus=random.randint(0, 1)
        )

    @staticmethod
    def create_random_posner_result(testResult: TestResult, testOrTrain: str, valid: bool):
        """
            "id": 1,
            "testResultId": 1,
            "TestOrTraining": "TEST",
            "CuePosition": "LEFT",
            "TargetPosition": "RIGHT",
            "CueValidity": "VALID",
            "CuedOrUncued": "CUED",
            "CueValidityAsNumber": 1,
            "ResponseTimeMs": 320,
            "ResponseStatus": 0
        """

        targetPosition = random.choice(["RIGHT", "LEFT"])
        cuePosition = targetPosition
        cueValid="VALID"
        cuedOrUncued="CUED"
        cuedValidAsNumber=1
        if not valid:
            cueValid="INVALID"
            cuedOrUncued="UNCUED"
            cuedValidAsNumber=0
            if targetPosition == "RIGHT":
                cuePosition="LEFT"
            else:
                cuePosition="RIGHT"



        return PosnerCueResult (
            id=0,
            testResultId=testResult.id,
            TestOrTraining=testOrTrain,
            CuePosition=cuePosition,
            TargetPosition=targetPosition,
            CueValidity=cueValid,
            CuedOrUncued=cuedOrUncued,
            CueValidityAsNumber=str(cuedValidAsNumber),
            ResponseTimeMs=random.randint(100,1000),
            ResponseStatus=random.randint(0,1)
        )

    @staticmethod
    def create_new_test_result(classifcation: str) -> TestResult:
        return Services.dbQueryFactory.create_new_test_result_non_structured(
            DevServerDatabaseSeed.TEST_ACCOUNT_ID,
            classifcation
        )

    @staticmethod
    def seed_task_switching_results():
        LogFactory.MAIN_LOG.info("Seed task switching Results")
        testResult: TestResult = DevServerDatabaseSeed.create_new_test_result("task_switching")

    @staticmethod
    def seed_gng_results():
        LogFactory.MAIN_LOG.info("Seed gng Results")

        for j in range(5):
            testResult: TestResult = DevServerDatabaseSeed.create_new_test_result("gng")

            for i in range(2):
                Services.dbQueryFactory.insert_gng_test_result(
                    DevServerDatabaseSeed.create_random_gng_result(
                        testResult=testResult,
                        goOrNoGo="NOGO"
                    )
                )

            for i in range(10):
                Services.dbQueryFactory.insert_gng_test_result(
                    DevServerDatabaseSeed.create_random_gng_result(
                        testResult=testResult,
                        goOrNoGo="GO"
                    )
                )

        LogFactory.MAIN_LOG.info("Gng seed complete")

    @staticmethod
    def seed_posner_results():
        LogFactory.MAIN_LOG.info("Seed posner Results")
        for z in range(10):
            testResult: TestResult = DevServerDatabaseSeed.create_new_test_result("posner")
            for j in range(7):
                Services.dbQueryFactory.insert_posner_test_result(
                    DevServerDatabaseSeed.create_random_posner_result(
                        testResult=testResult,
                        testOrTrain="TRAIN",
                        valid=True
                    )
                )
            for i in range(3):
                Services.dbQueryFactory.insert_posner_test_result(
                    DevServerDatabaseSeed.create_random_posner_result(
                        testResult=testResult,
                        testOrTrain="TRAIN",
                        valid=False
                    )
                )

            for j in range(7):
                Services.dbQueryFactory.insert_posner_test_result(
                    DevServerDatabaseSeed.create_random_posner_result(
                        testResult=testResult,
                        testOrTrain="TEST",
                        valid=True
                    )
                )
            for i in range(3):
                Services.dbQueryFactory.insert_posner_test_result(
                    DevServerDatabaseSeed.create_random_posner_result(
                        testResult=testResult,
                        testOrTrain="TEST",
                        valid=False
                    )
                )

        LogFactory.MAIN_LOG.info("End seed posner table")

    @staticmethod
    def seed_srt_results():
        LogFactory.MAIN_LOG.info("Seed SRT Results")
        for z in range(10):
            testResult: TestResult = DevServerDatabaseSeed.create_new_test_result("srt")

            for i in range(10):
                Services.dbQueryFactory.insert_srt_test_result(DevServerDatabaseSeed.create_random_srt_result(
                    testResult=testResult,
                    testOrTrain="dlsimple_training"
                ))
            for i in range(20):
                Services.dbQueryFactory.insert_srt_test_result(DevServerDatabaseSeed.create_random_srt_result(
                    testResult=testResult,
                    testOrTrain="dlsimple_real"
                ))

    @staticmethod
    def seed_db():
        if not CONF_INSTANCE.PRODUCTION_ENVIRONMENT:
            LogFactory.MAIN_LOG.info("Dev environment - Seed DB with test data")
            DevServerDatabaseSeed.seed_srt_results()
            DevServerDatabaseSeed.seed_posner_results()
            DevServerDatabaseSeed.seed_gng_results()
            DevServerDatabaseSeed.seed_task_switching_results()
        else:
            LogFactory.MAIN_LOG.info("Non-Dev environment - no DB seeding")


