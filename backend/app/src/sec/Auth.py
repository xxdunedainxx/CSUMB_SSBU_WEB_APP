# Authentication service
from src.data.db.DbQueryFactory import DbQueryFactory

"""
    TODO - IMPROVE AUTH!    
"""
class AuthenticationService:

    def __init__(self, dbQueryFactory: DbQueryFactory):
        self.dbQueryFactory = dbQueryFactory

    def authenticate(self, email, password) -> bool:
        pw = self.dbQueryFactory.fetch_user_password_by_email(email)
        return pw == password

    def authorize(self, userId, resource) -> bool:
        return True