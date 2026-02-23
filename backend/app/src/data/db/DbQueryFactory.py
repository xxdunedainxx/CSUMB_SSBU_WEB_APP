"""

"""
from datetime import datetime, timezone

from src.data.db.DBConnector import DBConnector
from src.data.db.model.User import User

"""
    Utility class for crafting/executing SQL queries against the DB 
"""
class DbQueryFactory:

    def __init__(self, dbConnector: DBConnector):
        self.dbConnector = dbConnector

    """
        Fetch a user by email 
    """
    def fetch_user_by_email(self) -> User:
        pass

    """
    
    """
    def fetch_user_password_by_email(self) -> User:
        pass

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
            query="INSERT INTO userTable (email, password, salt, verified, whenCreated) VALUES (%s, %s)",
            vars=(user.email,
                  user.password,
                  user.salt,
                  False, datetime.now(timezone.utc)
            )
        )

    """
        Create a new test result object 
    """
    def create_new_test_result(self):
        pass

    """
        Get test result information 
    """
    def get_test_results(self):
        pass

    """
        Create a new simple reaction time test result row 
    """
    def create_new_srt_test_result(self):
        pass