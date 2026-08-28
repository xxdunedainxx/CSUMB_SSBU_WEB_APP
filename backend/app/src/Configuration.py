"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: Configuration container class for all related application configurations. This should have things like:
    * Redis configs
    * DB configs
    * Feature TOGGLES
    * Flask configurations
    * Log Levels
    * etc..
"""
import os
import json
from src.ServiceNames import ServiceNames
from pathlib import Path

class Configuration:

  DEFAULT_VALUES : dict = {
    "SMTP_SERVER" : "smtp.gmail.com",
    "SMTP_PORT"   : 465,
    "MAIL_JOB_EMAILS_PER_JOB": 20,
    "MAIL_JOB_INTERVAL_MINUTES": 1,
    "FLASK_HOST_BIND" : "0.0.0.0",
    "FLASK_PORT_BIND" : 80,
    "GLOBAL_RATE_LIMIT_PER_MIN": 100,
    "APP_HEALTH_PORT" : 8080,
    "FLASK_CORS_ORIGIN": "http://localhost:4321",
    "AUTH_BYPASS": True,
    # "APP_HEALTH_ONLY_API_TOGGLE" : True,
    "SERVICE_TOGGLES" : {
      ServiceNames.mail : True,
      ServiceNames.apiServer : True,
      ServiceNames.logRotation: False,
      ServiceNames.redis: True,
      ServiceNames.db: True
    },
    "REACT_APP" : "http://localhost/ui/",
    "PRODUCTION_ENVIRONMENT" : False,
    "ENVIRONMENT_HOSTNAME" : "http://localhost",
    "ENCRYPTED_AT_REST": False,
    "REDIS_HOST": "localhost",
    "REDIS_PORT": 6379,
    "DEPLOY_EMAIL_LIST": [],
    "SESSION_KEY": "REPLACE_ME",
    "SESSION_EXPIRE_MINUTES" : 30,
    "STARTUP_DEPENDENCIES_RETRY_COUNT": 10,
    "STARTUP_DEPENDENCY_SLEEP_SECONDS": 10
  }

  def __init__(self, confFile: str = './conf-prod.json'):
    self.VERSION='0.1'
    self._init_conf(confFile)
    self._init_values()


  def _init_conf(self, conf: str):
    if 'RAW_CONF_FILE' in os.environ.keys():
      self.RAW_CONF: str = os.environ.get('RAW_CONF_FILE')
      self.CONF_FILE_LOCATION: str = None
    else:
      self.CONF_FILE_LOCATION: str  = conf
      self.RAW_CONF: str = open(self.CONF_FILE_LOCATION,"r").read().strip()
    print(f"Raw configuration file {self.RAW_CONF}")
    self.CONF: dict = json.loads(self.RAW_CONF)


  def _init_values(self):
    # SMTP CONFIGS
    self.SMTP_SERVER: str = self._get_value("SMTP_SERVER")
    self.SMTP_PORT: int = self._get_value("SMTP_PORT")
    self.SMTP_USERNAME: str = self._get_value("SMTP_USERNAME")
    self.SMTP_PASSWORD: str = self._get_value("SMTP_PASSWORD")
    self.DEPLOY_EMAIL_LIST: [str] = self._get_value("DEPLOY_EMAIL_LIST")

    # Redis Configs
    self.REDIS_HOST: str = self._get_value("REDIS_HOST")
    self.REDIS_PORT: int = self._get_value("REDIS_PORT")
    # self.MAILER_TOGGLE: bool = self._get_value("MAILER_TOGGLE")

    # Flask configurations
    self.FLASK_HOST_BIND: str = self._get_value("FLASK_HOST_BIND")
    self.FLASK_PORT_BIND: int = self._get_value("FLASK_PORT_BIND")
    self.FLASK_CORS_ORIGIN: str = self._get_value("FLASK_CORS_ORIGIN")
    # self.APP_HEALTH_PORT: bool = self._get_value("APP_HEALTH_PORT")

    # General Configs
    self.SERVICE_TOGGLES: dict = self._get_value("SERVICE_TOGGLES")
    self.PRODUCTION_ENVIRONMENT: bool = self._get_value("PRODUCTION_ENVIRONMENT")
    # self.ENVIRONMENT_HOSTNAME: bool = self._get_value("ENVIRONMENT_HOSTNAME")
    self.DB: dict = self._get_value("DB")
    self.ENCRYPTED_AT_REST: bool = self._get_value("ENCRYPTED_AT_REST")
    self.APP_HEALTH_PORT: int = self._get_value("APP_HEALTH_PORT")
    self.ENVIRONMENT_HOSTNAME: bool = self._get_value("ENVIRONMENT_HOSTNAME")
    self.MAIL_JOB_EMAILS_PER_JOB: int = self._get_value("MAIL_JOB_EMAILS_PER_JOB")
    self.MAIL_JOB_INTERVAL_MINUTES: int = self._get_value("MAIL_JOB_INTERVAL_MINUTES")
    # For development, will bypass auth for debugging purposes. will always be skipped if PROD
    self.AUTH_BYPASS: bool = self._get_value("AUTH_BYPASS")
    self.GLOBAL_RATE_LIMIT_PER_MIN: int = self._get_value("GLOBAL_RATE_LIMIT_PER_MIN")
    self.SESSION_KEY: str = self._get_value("SESSION_KEY")
    self.SESSION_EXPIRE_MINUTES: int = self._get_value("SESSION_EXPIRE_MINUTES")
    self.REACT_APP: str = self._get_value("REACT_APP")
    self.BASE_DIR = Path(__file__).resolve().parent
    self.STARTUP_DEPENDENCIES_RETRY_COUNT: int = self._get_value("STARTUP_DEPENDENCIES_RETRY_COUNT")
    self.STARTUP_DEPENDENCY_SLEEP_SECONDS: int = self._get_value("STARTUP_DEPENDENCY_SLEEP_SECONDS")


    if self.PRODUCTION_ENVIRONMENT == True and self.ENCRYPTED_AT_REST == False:
      raise Exception("NEED ENCRYPTION IN PROD")


  def _get_value(self, key: str):
    # environment variables have highest prio
    if key in os.environ.keys():
      return self.__get_environ_value(key)
    elif key in self.CONF.keys():
      return self.__parse_conf_file_value(key)
    elif key in Configuration.DEFAULT_VALUES.keys():
      return self.DEFAULT_VALUES[key]
    else:
      raise Exception(f"Could not find value for required key {key} :(")

  def __get_environ_value(self, key: str):
    return os.environ.get(key)

  def __parse_conf_file_value(self, key: str):
    return self.CONF[key]

CONF_INSTANCE = Configuration()

if "CONF_FILE_LOCATION_OVERRIDE" in os.environ.keys():
  CONF_INSTANCE = Configuration(os.environ.get("CONF_FILE_LOCATION_OVERRIDE"))