"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: Central class for managing services
"""
from src.data.db.DBConnector import DBConnector
from src.data.db.DbQueryFactory import DbQueryFactory
from src.toggle.Toggle import ToggleService
from src.Configuration import CONF_INSTANCE

"""
    Can be used for simple dependency injection
"""
class Services:
    mail: str = "mailer"
    apiServer: str = "api_server"
    logRotation: str = "log_rotator"
    redis: str = 'redis'
    mysql: str = 'mysql'
    toggleService: ToggleService = None
    dbQueryFactory: DbQueryFactory = None
    @staticmethod
    def initialize_services():
        Services.toggleService = ToggleService("./toggles.json")
        Services.dbQueryFactory = DbQueryFactory(
            dbConnector=DBConnector(
                host=CONF_INSTANCE.DB["host"],
                databaseName=CONF_INSTANCE.DB["db"],
                username=CONF_INSTANCE.DB["username"],
                password=CONF_INSTANCE.DB["password"],
                port=CONF_INSTANCE.DB["port"]
            )
        )
