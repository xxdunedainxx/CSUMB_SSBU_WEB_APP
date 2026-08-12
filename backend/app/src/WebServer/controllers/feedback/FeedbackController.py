"""
  Author: Zach McFadden
  Date: 7/3/26
  Synopsis: Feedback controller
"""
from src.util.LogFactory import LogFactory
from src.WebServer.decorators.HTTPLogger import http_logger
from src.WebServer.WebServerInit import WebServerInit
from src.util.ErrorFactory import errorStackTrace
from src.Services import Services
from src.Configuration import CONF_INSTANCE
from src.mail.MailFormatter import MailTypes

from flask import Flask, request

flask_ref: Flask = WebServerInit.flask

class FeedbackController:

  def __init__(self):
    LogFactory.MAIN_LOG.info('Start Feedback controller')

  @staticmethod
  @flask_ref.route('/feedback', methods=['POST'])
  @http_logger
  def feedback():
    try:
      feedback = request.json["feedback"]

      Services.dbQueryFactory.store_feedback(feedback)

      Services.mailQueue.add_to_queue(
        emailType=MailTypes.FEEDBACK,
        data={
          "feedback": feedback,
          "email": CONF_INSTANCE.DEPLOY_EMAIL_LIST,
          "subject": "User Feedback submitted"
        }
      )

      return {
        "response" : "Feedback submitted!"
      }
    except Exception as e:
      LogFactory.MAIN_LOG.error(f"Failed submitting feedback {errorStackTrace(e)}")
      return {
        "response" : "sadness"
      }, 500
