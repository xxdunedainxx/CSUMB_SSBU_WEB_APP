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
from src.Services import ServiceNames

class Configuration:

  DEFAULT_VALUES : dict = {
    "SMTP_SERVER" : "smtp.gmail.com",
    "SMTP_PORT"   : 465,
    "FLASK_HOST_BIND" : "0.0.0.0",
    "FLASK_PORT_BIND" : 80,
    "FLASK_CORS_ORIGIN": "*",
    # "APP_HEALTH_PORT" : 9090,
    # "APP_HEALTH_ONLY_API_TOGGLE" : True,
    "SERVICE_TOGGLES" : {
      ServiceNames.mail : False,
      ServiceNames.apiServer : False,
      ServiceNames.logRotation: False,
      ServiceNames.redis: False
    },
    "REACT_APP" : "http://localhost",
    "PRODUCTION_ENVIRONMENT" : False,
    "ENVIRONMENT_HOSTNAME" : "localhost"
  }

  def __init__(self, confFile: str = './conf.json'):
    self.VERSION='1.3.0'
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
    # self.SMTP_SERVER: str = self._get_value("SMTP_SERVER")
    # self.SMTP_PORT: int = self._get_value("SMTP_PORT")
    # self.SMTP_USERNAME: str = self._get_value("SMTP_USERNAME")
    # self.SMTP_PASSWORD: str = self._get_value("SMTP_PASSWORD")

    # Redis Configs
    # self.REDIS_HOST: str = self._get_value("REDIS_HOST")
    # self.REDIS_PORT: int = self._get_value("REDIS_PORT")
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