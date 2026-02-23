"""
TODO -- FILL OUT AUTHOR COMMENT
  Author:
  Date:
  Synopsis:
"""
from src.util.LogFactory import LogFactory
from src.WebServer.decorators.HTTPLogger import http_logger
from src.WebServer.WebServerInit import WebServerInit
from src.util.ErrorFactory import errorStackTrace

from flask import Flask, request

flask_ref: Flask = WebServerInit.flask

class FeedbackController:

  def __init__(self):
    LogFactory.MAIN_LOG.info('Start FeedbackController')

  """
    TODO -- VALIDATE THE PAYLOAD
  """
  @staticmethod
  def __is_valid_post_payload(requestBody) -> bool:
    return False

  """
    TODO -- what SHOULD happen here?
        .... NOTE: this may not possible to FULLY implement, until we have some of the database  stuff in place.
  """
  @staticmethod
  def __submit_feedback(requestBody):
      pass

  """
    TODO -- function comment 
  """
  @staticmethod
  @flask_ref.route('/submitFeedback', methods=['POST'])
  @http_logger
  def handle_submit_feedback():
    try:
      LogFactory.MAIN_LOG.info("Process feedback request")

      requestBody=request.json

      if FeedbackController.__is_valid_post_payload(requestBody):
          FeedbackController.__submit_feedback(requestBody)
          return {
            "response" : "feedback submitted!"
          }, 200
      else:
          # TODO what else should we do for bad payloads?
          return {
              "response": "invalid feedback"
          }, 400
    except Exception as e:
      LogFactory.MAIN_LOG.error(f"Something bad happened while processing the feedback provided {errorStackTrace(e)}")
      return {
        "response" : ":("
      }, 500