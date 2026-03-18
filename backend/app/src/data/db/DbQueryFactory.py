"""
  Author: Zach McFadden
  Date: 2/16/26
  Synopsis: Central class for CRAFTING and EXECUTING DB queries.
"""
from datetime import datetime, timezone

from src.data.db.DBConnector import DBConnector
from src.data.db.model.TestResult import TestResult
from src.data.db.model.User import User
from src.util.DateTimeUtil import DateTimeUtils

"""
    Utility class for crafting/executing SQL queries against the DB 
"""
class DbQueryFactory:

    def __init__(self, dbConnector: DBConnector):
        self.dbConnector = dbConnector

    """
        Fetch a user by email 
    """
    def fetch_user_by_email(self, email: str) -> User:
        record=self.dbConnector.read_data(
            query="SELECT id, email, password, salt, verified, whenCreated, lastLogin FROM userTable WHERE email=%s",
            vars=(email,)
        )
        print(record)
        return User (
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
        return str(self.dbConnector.read_data(
                query="SELECT password FROM userTable WHERE email=%s",
                vars=(email,)
            )[0]
        )

    """
        Create a new user object 
        
        Ref model: 
            email VARCHAR(1000) NOT NULL,
            password VARCHAR(1000) NOT NULL,
            salt VARCHAR(100) NOT NULL,
            verified BOOLEAN NOT NULL,
            whenCreated TIMESTAMPTZ,
            lastLogin TIMESTAMPTZ,
    """
    def create_new_user(self, user: User):
        self.dbConnector.write_or_update_data(
            query="INSERT INTO userTable (email, password, salt, verified, whenCreated) VALUES (%s, %s, %s, %s, %s)",
            vars=(
              user.email,
              user.password,
              user.salt,
              False,
              DateTimeUtils.get_current_datetime_in_iso_format_str()
            )
        )

    """
        Create a new test result object 
    """
    def create_new_test_result(self, testRsult: TestResult):
        self.dbConnector.write_or_update_data(
            query="INSERT INTO testResults (userID, whenGenerated, classification) VALUES (%s, %s, %s)",
            vars=(
                testRsult.userId,
                DateTimeUtils.get_current_datetime_in_iso_format_str(),
                testRsult.classification
            )
        )

    """
        TODO Get test result information 
    """
    def get_test_results(self):
        pass

    """
        TODO Create a new simple reaction time test result row 
    """
    def create_new_srt_test_result(self):
        pass