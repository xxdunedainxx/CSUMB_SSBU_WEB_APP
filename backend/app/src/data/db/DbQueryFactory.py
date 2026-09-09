"""
  Author: Zach McFadden
  Date: 2/16/26
  Synopsis: Central class for CRAFTING and EXECUTING DB queries.
"""
import json
import secrets
from datetime import datetime, timezone
from typing import Optional

from src.data.db.DBConnector import DBConnector
from src.data.db.model.CompleteTestResults import CompleteTestResults
from src.data.db.model.GngTestResult import GngTestResult
from src.data.db.model.PosnerCueResult import PosnerCueResult
from src.data.db.model.ControllerTestResult import ControllerTestResult
from src.data.db.model.SrtTestResult import SrtTestResult
from src.data.db.model.TaskSwitchingResult import TaskSwitchingResults
from src.data.db.model.TestResult import TestResult
from src.data.db.model.User import User
from src.util.DateTimeUtil import DateTimeUtils
from src.Configuration import CONF_INSTANCE
from src.sec.Crypto import CryptoService

"""
    Utility class for crafting/executing SQL queries against the DB 
"""
class DbQueryFactory:

    def __init__(self, dbConnector: DBConnector):
        self.dbConnector = dbConnector

    def check_health(self) -> bool:
        return self.dbConnector.ping()

    """
        NOTE: Database errors are intentionally not caught here. if they were, a failed read 
        would cause the registration function to create a duplicate account
    """
    def check_account_exists(self, email: str) -> bool:
        return self.fetch_user_by_email(email) is not None

    def check_registration_token(self, token: str) -> bool:
        try:
            record = self.dbConnector.read_data(
                query="SELECT registrationToken FROM userTable WHERE registrationToken=%s",
                vars=(token,)
            )
            return len(record[0]) > 0
        except Exception as e:
            return False

    def is_account_verified(self, email: str) -> str:
        return bool((self.dbConnector.read_data(
                query="SELECT verified FROM userTable WHERE email=%s",
                vars=(email,)
            )[0][0]))

    def store_feedback(self, feedback: str) -> str:
        self.dbConnector.write_or_update_data(
            query="INSERT INTO feedback (feedback) VALUES (%s) RETURNING id",
            vars=(feedback,)
        )

    def verify_account(self, token):
        self.dbConnector.write_or_update_data(
            query="UPDATE userTable SET verified=%s WHERE registrationToken=%s",
            vars=(True, token,)
        )

    """
        Fetch a user by email. Returns None when no account exists for that email.
    """
    def fetch_user_by_email(self, email: str) -> Optional[User]:
        record=self.dbConnector.read_data(
            query="SELECT id, email, password, salt, verified, whenCreated, lastLogin FROM userTable WHERE email=%s",
            vars=(email,)
        )

        if not record:
            return None

        return User(
            id=int(record[0][0]),
            email=str(record[0][1]),
            password=str(record[0][2]),
            salt=str(record[0][3]),
            verified=bool(record[0][4]),
            whenCreated=DateTimeUtils.convert_pg_time_to_iso(str(record[0][5])),
            lastLogin=record[0][6]
        )


    """
        Fetches password from userTable. 
        
        NOTE: The password will be hashed w/ a salt, so that needs to be pre-computed before hitting this function.
         ... Also the emails will likely be encrypted at rest.
    """
    def fetch_user_password_by_email(self, email: str) -> str:
        return str((self.dbConnector.read_data(
                query="SELECT password FROM userTable WHERE email=%s",
                vars=(email,)
            )[0][0])
        )

    """
        Create a new user object

        The salt is generated here, so any salt set on the incoming User object is ignored.
        Only the hash stays, the plaintext password never reaches the DB.

        Ref model:
            email VARCHAR(1000) NOT NULL,
            password VARCHAR(1000) NOT NULL,
            salt VARCHAR(100) NOT NULL,
            verified BOOLEAN NOT NULL,
            whenCreated TIMESTAMPTZ,
            lastLogin TIMESTAMPTZ,
    """
    def create_new_user(self, user: User):
        """
        - sort of over-engineering, but the randomNumberGenerator becomes predictable if given enough outputs
        - using token_hex reduces the chance of the salt being pre-computed, since its output is a one way
        function of internal state that cannot be worked backwards from
        """
        salt: str = secrets.token_hex(16)
        hashed_password: str = CryptoService.sha256_hash_string(user.password + salt)

        return self.dbConnector.write_or_update_data(
            query="INSERT INTO userTable (email, password, salt, verified, whenCreated, registrationToken) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            vars=(
              user.email,
              hashed_password,
              salt,
              False,
              DateTimeUtils.get_current_datetime_in_iso_format_str(),
              user.registrationToken
            )
        )

    """
        Create a new test result object 
    """
    def create_new_test_result(self, testRsult: TestResult):
        return self.dbConnector.write_or_update_data(
            query="INSERT INTO testResults (userID, whenGenerated, classification) VALUES (%s, %s, %s) RETURNING id, userID, whenGenerated, classification",
            vars=(
                testRsult.userId,
                DateTimeUtils.get_current_datetime_in_iso_format_str(),
                testRsult.classification
            )
        )

    def create_new_test_result_non_structured(self, userId: str, classification: str) -> TestResult:
        record= self.dbConnector.write_or_update_data(
            query="INSERT INTO testResults (userID, whenGenerated, classification) VALUES (%s, %s, %s) RETURNING id, userID, whenGenerated, classification",
            vars=(
                userId,
                DateTimeUtils.get_current_datetime_in_iso_format_str(),
                classification
            )
        )

        return TestResult(
            id=record[0][0],
            userId=record[0][1],
            whenGenerated=record[0][2],
            classification=record[0][3]
        )

    """
        Simple utility to get all user test result data IDs
    """
    def get_all_user_test_result_ids(self, userId: int):
        testResultDbRecords = self.dbConnector.read_data(
            query="SELECT id from testResults WHERE userID=%s",
            vars=(userId,)
        )

        testIDs : [int] = []

        for res in testResultDbRecords:
            testIDs.append(int(res[0]))

        return testIDs

    """
        Fetches an object containing all test and trial related data 
    """
    def get_test_results(self, testId: int, userId: int) -> CompleteTestResults:
        testResultDbRecord = self.dbConnector.read_data(
            query="SELECT userID, whenGenerated, classification from testResults WHERE id=%s AND userID=%s",
            vars=(testId,userId,)
        )

        testRecord=TestResult(
            id=testId,
            userId=testResultDbRecord[0][0],
            whenGenerated=testResultDbRecord[0][1],
            classification=testResultDbRecord[0][2]
        )

        gngRecords = self.get_gng_test_results(testId=testId)
        posnerRecords = self.get_posner_cue_results(testId=testId)
        controllerRecords = self.get_controller_test_results(testId=testId)
        srtRecords = self.get_srt_results(testId=testId)
        taskRecords = self.get_task_switching_results(testId=testId)
        return CompleteTestResults(
            testResult=testRecord,
            GngTestResults=gngRecords,
            PosnerRecords=posnerRecords,
            ControllerRecords=controllerRecords,
            SrtRecords=srtRecords,
            TaskSwitchingRecords=taskRecords
        )


    """
        TODO Create a new simple reaction time test result row 
    """
    def create_new_srt_test_result(self, srt: SrtTestResult):
        pass

    def get_gng_test_results(self, testId: int):
        allResults = self.dbConnector.read_data(
            query="SELECT id, payload FROM gngTestResultData WHERE testResultId=%s",
            vars=(testId,)
        )

        structuredGngResults: [GngTestResult] = []

        for res in allResults:
            jsonData=self.__decrypt_data(bytes(res[1]))
            structuredGngResults.append(
                GngTestResult(
                    id=int(res[0]),
                    testResultId=testId,
                    GoNoGoAndTestOrTrial=jsonData["GoNoGoAndTestOrTrial"],
                    ResponseTimeMs=jsonData["ResponseTimeMs"],
                    ErrorStatus=jsonData["ErrorStatus"]
                )
            )

        return structuredGngResults

    def get_posner_cue_results(self, testId: int):
        allResults = self.dbConnector.read_data(
            query="SELECT id, payload FROM posnerQueueTestResultData WHERE testResultId=%s",
            vars=(testId,)
        )

        structuredPosnerResults: [PosnerCueResult] = []

        for res in allResults:
            jsonData=self.__decrypt_data(bytes(res[1]))
            structuredPosnerResults.append(
                PosnerCueResult(
                    id=int(res[0]),
                    testResultId=testId,
                    TestOrTraining=jsonData["TestOrTraining"],
                    CuePosition=jsonData["CuePosition"],
                    TargetPosition=jsonData["TargetPosition"],
                    CueValidity=jsonData["CueValidity"],
                    CuedOrUncued=jsonData["CuedOrUncued"],
                    CueValidityAsNumber=jsonData["CueValidityAsNumber"],
                    ResponseTimeMs=jsonData["ResponseTimeMs"],
                    ResponseStatus=jsonData["ResponseStatus"]
                )
            )

        return structuredPosnerResults
    
    def get_controller_test_results(self, testId: int):
        allResults = self.dbConnector.read_data(
            query="SELECT id, resultType, payload FROM controllerTestResultData WHERE testResultId=%s",
            vars=(testId,)
        )

        structuredControllerResults: [ControllerTestResult] = []

        for res in allResults:
            jsonData=self.__decrypt_data(bytes(res[2]))
            structuredControllerResults.append(
                ControllerTestResult(
                    id=int(res[0]),
                    testResultId=testId,
                    resultType=str(res[1]),
                    payload=jsonData
                )
            )

        return structuredControllerResults

    def get_srt_results(self, testId: int):
        allResults = self.dbConnector.read_data(
            query="SELECT id, payload FROM srtTestResultData WHERE testResultId=%s",
            vars=(testId,)
        )

        # list of srt result objects
        structured_srt: [SrtTestResult] = []

        for result in allResults:
            # takes database row and converts it to a dictionary
            jsonObj = self.__decrypt_data(bytes(result[1]))
            # abstraction
            structured_srt.append(
                SrtTestResult(
                    id=int(result[0]),
                    testResultId=jsonObj["testResultId"],
                    TestOrTraining=jsonObj["TestOrTraining"],
                    TrainingOrReal=jsonObj["TrainingOrReal"],
                    NumberOfChoices=jsonObj["NumberOfChoices"],
                    TimeBetweenResponseAndNextTrial=jsonObj["TimeBetweenResponseAndNextTrial"],
                    XCoordinateTargetStim=jsonObj["XCoordinateTargetStim"],
                    ResponseTimeMs=jsonObj["ResponseTimeMs"],
                    StatusOfAnswer=jsonObj["StatusOfAnswer"],

                )
            )
        return structured_srt

    def get_task_switching_results(self, testId: int):
        allResults = self.dbConnector.read_data(
            query="SELECT id, payload FROM taskSwitchingTestResultData WHERE testResultId=%s",
            vars=(testId,)
        )

        # list of task switching result objects
        structured_taskSwitching: [TaskSwitchingResults] = []

        for result in allResults:
            # takes database row and converts it to a dictionary
            jsonObj = self.__decrypt_data(bytes(result[1]))
            # abstraction
            structured_taskSwitching.append(
                TaskSwitchingResults(
                    id=int(result[0]),
                    testResultId=jsonObj["testResultId"],
                    TaskSwitchTypeAndTestOrTrial=jsonObj["TaskSwitchTypeAndTestOrTrial"],
                    position=jsonObj["position"],
                    taskType=jsonObj["taskType"],
                    numberStimulus=jsonObj["numberStimulus"],
                    letterStimulus=jsonObj["letterStimulus"],
                    typeOfBlock=jsonObj["typeOfBlock"],
                    taskSwitchOrTaskRepeat=jsonObj["taskSwitchOrTaskRepeat"],
                    status=jsonObj["status"],
                    ResponseTimeMs=jsonObj["ResponseTimeMs"],
                    totalTimeMs=jsonObj["totalTimeMs"]

                )
            )
        return structured_taskSwitching

    """
    CREATE TABLE IF NOT EXISTS gngTestResultData(
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        testResultId INT REFERENCES testResults(id), -- link back to entire testing set result
        GoNoGoAndTestOrTrial VARCHAR(1000) NOT NULL,
        ResponseTimeMs INT NOT NULL,
        ErrorStatus INT NOT NULL
    );
    """
    def insert_gng_test_result(self, gngTestResult: GngTestResult):
        return self.dbConnector.write_or_update_data(
            query="INSERT INTO gngTestResultData (testResultId, payload) VALUES (%s, %s)",
            vars=(
                gngTestResult.testResultId, self.__encrypt_data(gngTestResult.serialize())
            )
        )
    
    def insert_posner_test_result(self, posnerTestResult: PosnerCueResult):
        return self.dbConnector.write_or_update_data(
            query="INSERT INTO posnerQueueTestResultData (testResultId, payload) VALUES (%s, %s)",
            vars=(
                posnerTestResult.testResultId, self.__encrypt_data(posnerTestResult.serialize())
            )
        )
    
    def insert_controller_test_result(self, controllerTestResult: ControllerTestResult):
        return self.dbConnector.write_or_update_data(
            query="INSERT INTO controllerTestResultData (testResultId, resultType, payload) VALUES (%s, %s, %s)",
            vars=(
                controllerTestResult.testResultId,
                controllerTestResult.resultType,
                self.__encrypt_data(controllerTestResult.payload)
            )
        )

    def insert_srt_test_result(self, SrtResult: SrtTestResult):
        return self.dbConnector.write_or_update_data(
            query="INSERT INTO srtTestResultData (testResultId, payload) VALUES (%s, %s)",
            vars=(
                SrtResult.testResultId, self.__encrypt_data(SrtResult.serialize())
            )
        )

    def insert_task_switching_result(self, task: TaskSwitchingResults):
        return self.dbConnector.write_or_update_data(
            query="INSERT INTO taskSwitchingTestResultData (testResultId, payload) VALUES (%s, %s)",
            vars=(
                task.testResultId, self.__encrypt_data(task.serialize())
            )
        )

    def __encrypt_data(self, jsonData: dict):
        jsonStr = json.dumps(jsonData)
        # TODO ENCRYPTION AT REST
        if CONF_INSTANCE.ENCRYPTED_AT_REST:
            return ""
        else:
            return jsonStr.encode("utf-8")

    def __decrypt_data(self, cipherText: bytes) -> dict:
        if CONF_INSTANCE.ENCRYPTED_AT_REST:
            return {}
        else:
            return json.loads(cipherText.decode("utf-8"))
