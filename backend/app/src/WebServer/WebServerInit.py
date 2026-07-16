"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: This class is a simple container class for setting up the flask instance. Will set things like the CORs policy.
"""
from datetime import timedelta

from src.util.LogFactory import LogFactory
from src.Configuration import CONF_INSTANCE
from src.WebServer.decorators.requestprocessing.RequestProcessor import RequestProcessor


from flask import Flask, session
from flask_cors import CORS

class WebServerInit:

  flask: Flask = Flask(__name__)
  reqProcessor: RequestProcessor = None

  def __init__(self):
    pass

  @staticmethod
  def init_flask():
    LogFactory.MAIN_LOG.info('Start flask API')
    WebServerInit.configure_cors()
    WebServerInit.session_configs()
    WebServerInit.reqProcessor = RequestProcessor(WebServerInit.flask)

  @staticmethod
  def configure_cors():
    CORS(
      WebServerInit.flask,
      supports_credentials=True,
      resources={
        r"/*": {
          "origins": CONF_INSTANCE.FLASK_CORS_ORIGIN
        }
      }
    )

  @staticmethod
  def session_configs():
    WebServerInit.flask.secret_key = CONF_INSTANCE.SESSION_KEY
    WebServerInit.flask.config.update(
      SESSION_COOKIE_HTTPONLY=True,    # prevents JS access (XSS protection)
      SESSION_COOKIE_SECURE=True,      # HTTPS only (critical in prod)
      SESSION_COOKIE_SAMESITE="Lax",   # CSRF mitigation
    )
    WebServerInit.flask.permanent_session_lifetime = timedelta(minutes=CONF_INSTANCE.SESSION_EXPIRE_MINUTES)
