"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: This class is a simple container class for setting up the flask instance. Will set things like the CORs policy.
"""
from src.util.LogFactory import LogFactory
from src.Configuration import CONF_INSTANCE

from flask import Flask
from flask_cors import CORS

class WebServerInit:

  flask: Flask = Flask(__name__)

  def __init__(self):
    pass

  @staticmethod
  def init_flask():
    LogFactory.MAIN_LOG.info('Start flask API')
    CORS (
      WebServerInit.flask,
      resources={
        r"/*" : {
          "origins": CONF_INSTANCE.FLASK_CORS_ORIGIN
        }
      }
    )

  @staticmethod
  def configure_cors():
    pass
