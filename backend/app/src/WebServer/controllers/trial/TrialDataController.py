"""
  Author: Zach McFadden
  Date: 4/24/2026
  Synopsis: Trial controller for fetching & updating trial records
"""
from src.Services import Services
from src.util.LogFactory import LogFactory
from src.WebServer.decorators.HTTPLogger import http_logger
from src.WebServer.WebServerInit import WebServerInit
from src.util.ErrorFactory import errorStackTrace

from flask import Flask

flask_ref: Flask = WebServerInit.flask

class TrialController:

  def __init__(self):
    LogFactory.MAIN_LOG.info('Start TestController')
    self.dbQueryFactory = Services.dbQueryFactory

  @staticmethod
  @flask_ref.route('/create_new_test_result_entry', methods=['POST'])
  @http_logger
  def create_new_test_result_entry():
    try:
      LogFactory.MAIN_LOG.info("test api")
      return {
        "response" : "hello world"
      }
    except Exception as e:
      LogFactory.MAIN_LOG.error(f"Failed Fetching test api {errorStackTrace(e)}")
      return {
        "response" : "sadness"
      }, 500

  @staticmethod
  @flask_ref.route('/upload_gng_test_results', methods=['POST'])
  @http_logger
  def upload_gng_test_results():
    try:
      LogFactory.MAIN_LOG.info("test api")
      return {
        "response" : "hello world"
      }
    except Exception as e:
      LogFactory.MAIN_LOG.error(f"Failed Fetching test api {errorStackTrace(e)}")
      return {
        "response" : "sadness"
      }, 500

  @staticmethod
  @flask_ref.route('/get_test_result_data', methods=['GET'])
  @http_logger
  def get_test_result_data():
    try:
      LogFactory.MAIN_LOG.info("test api")
      return {
        "response" : "hello world"
      }
    except Exception as e:
      LogFactory.MAIN_LOG.error(f"Failed Fetching test api {errorStackTrace(e)}")
      return {
        "response" : "sadness"
      }, 500