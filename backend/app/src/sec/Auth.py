# Authentication service
from src.data.db.DbQueryFactory import DbQueryFactory
from src.sec.Crypto import CryptoService
from src.Configuration import CONF_INSTANCE
from flask import request

"""
"""
class AuthenticationService:

    def __init__(self, dbQueryFactory: DbQueryFactory):
        self.dbQueryFactory = dbQueryFactory

    def __bypass_auth(self) -> bool:
        return CONF_INSTANCE.AUTH_BYPASS and CONF_INSTANCE.PRODUCTION_ENVIRONMENT == False

    def authenticate(self, email, password) -> bool:
        if self.__bypass_auth():
            return True

        current_user = self.dbQueryFactory.fetch_user_by_email(email)
        stored_password_hash = current_user.password
        salt = current_user.salt
        attempted_password_hash = CryptoService.sha256_hash_string(password + salt)
        return current_user.verified and stored_password_hash == attempted_password_hash

    def authorize(self, session, endpoint, requestArgs) -> bool:
        return ("user_id" not in session  == False) and self.__endpoint_authorization_check(session, endpoint, requestArgs)

    # TODO - Need to implement access controls here. Check if user has access to a given endpoint
    def __endpoint_authorization_check(self, session, endpoint, requestArgs):
        return self.__trial_data_auth_check(session, endpoint, requestArgs)

    def __trial_data_auth_check(self,session, endpoint, requestArgs):
        if endpoint == "get_test_result_data" or endpoint == "get_all_test_ids":
            return session["user_id"] == requestArgs["userId"]
        elif endpoint == "create_new_test_result_entry":
            return session["user_id"] == request.json["userId"]
        #  TODO -- ALL TESTS uploads SHOULD HAVE AUTH
        else:
            return True

    def __default_auth_check(self) -> bool:
        return True