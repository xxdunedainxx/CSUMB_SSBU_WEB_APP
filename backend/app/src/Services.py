"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: Central class for managing services
"""
from src.data.db.DBConnector import DBConnector
from src.data.db.DbQueryFactory import DbQueryFactory
from src.sec.Auth import AuthenticationService
from src.toggle.Toggle import ToggleService
from src.Configuration import CONF_INSTANCE
from src.data.redis.RedisConnector import RedisConnector
from src.data.redis.Queues.MailQueue import MailQueue
from src.ServiceNames import ServiceNames
from src.mail.SmtpConnector import SMTP
"""
    Can be used for simple dependency injection
"""
class Services:
    mail: str = ServiceNames.mail
    apiServer: str = ServiceNames.apiServer
    logRotation: str = ServiceNames.logRotation
    redis: str = ServiceNames.redis
    db: str = ServiceNames.db
    metrics: str=ServiceNames.metricsJob

    toggleService: ToggleService = None
    dbQueryFactory: DbQueryFactory = None
    authService: AuthenticationService = None
    redisService: RedisConnector = None
    smtpService: SMTP = None
    mailQueue: MailQueue = None
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
        Services.authService = AuthenticationService(dbQueryFactory=Services.dbQueryFactory)
        Services.redisService = RedisConnector(CONF_INSTANCE.REDIS_HOST, CONF_INSTANCE.REDIS_PORT)
        Services.smtpService = SMTP(
            username=CONF_INSTANCE.SMTP_USERNAME,
            password=CONF_INSTANCE.SMTP_PASSWORD,
            smtpServer=CONF_INSTANCE.SMTP_SERVER,
            smtpPort=CONF_INSTANCE.SMTP_PORT
        )
        Services.mailQueue = MailQueue(Services.redisService)
