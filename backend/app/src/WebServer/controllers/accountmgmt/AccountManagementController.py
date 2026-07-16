"""
  Author: Zach McFadden
  Date: 7/3/26
  Synopsis: Account management functions
"""
from src.util.LogFactory import LogFactory
from src.WebServer.decorators.HTTPLogger import http_logger
from src.WebServer.WebServerInit import WebServerInit
from src.util.ErrorFactory import errorStackTrace
from src.Services import Services
from src.data.db.model.User import User
from src.sec.DataValidation import Email as EmailVerify
from src.util.RandomNumberGenerator import RandomNumberGenerator
from src.Configuration import CONF_INSTANCE
from src.mail.MailFormatter import MailTypes

from flask import Flask, request

flask_ref: Flask = WebServerInit.flask

class AccountManagementController:

  def __init__(self):
    LogFactory.MAIN_LOG.info('Start AccountManageMentController')

  @staticmethod
  def __generate_registration_token():
    while True:
        token = RandomNumberGenerator.generate_random_string(50)
        if Services.dbQueryFactory.check_registration_token(token) == False:
            return token

  @staticmethod
  def __construct_verify_link(verificationToken: str) -> str:
    # http://localhost:4321/verify?verificationToken=5W4IW127188BO0B41535DAXP75X93O5AO1RZ8OYSNTK5XSS9O2
    return f"{CONF_INSTANCE.REACT_APP}verify/?verificationToken={verificationToken}"

  """
    Invalid email req example: curl -XPOST localhost:80/register -d '{"email": "zrmmaster92", "password": "test"}' -H "Content-Type: application/json"
    Good email: curl -XPOST localhost:80/register -d '{"email": "zrmmaster92@gmail.com", "password": "test"}' -H "Content-Type: application/json"
    curl -XPOST localhost:80/register -d '{"email": "zrmmaster9222@gmail.com", "password": "test"}' -H "Content-Type: application/json"
  """
  @staticmethod
  @flask_ref.route('/register', methods=['POST'])
  @http_logger
  def register():
    try:
      LogFactory.MAIN_LOG.info("register api")
      accountDetails = request.json
      LogFactory.MAIN_LOG.info(
        f"Verify email: {EmailVerify.verify_email(accountDetails['email'])} && {Services.dbQueryFactory.check_account_exists(accountDetails['email'])}")
      if EmailVerify.verify_email(accountDetails["email"]) == False or Services.dbQueryFactory.check_account_exists(accountDetails["email"]) == True:
        return {
          "response": "Could not create account"
        }, 400
      else:
        registerToken=AccountManagementController.__generate_registration_token()

        Services.mailQueue.add_to_queue(
          emailType=MailTypes.VERIFY,
          data={
            "verifyLink": AccountManagementController.__construct_verify_link(registerToken),
            "email": accountDetails['email'],
            "subject": "Account Verification"
          }
        )

        Services.dbQueryFactory.create_new_user(
          user=User(
            id=0,
            email=accountDetails["email"],
            password=accountDetails["password"],
            salt="",
            verified=False,
            whenCreated=None,
            lastLogin=None,
            registrationToken=registerToken
          )
        )

        return {
          "response" : f"Account created. Check email for verification of account verification. Token: {registerToken}. {AccountManagementController.__construct_verify_link(registerToken)}"
        }
    except Exception as e:
      LogFactory.MAIN_LOG.error(f"Failed registering {errorStackTrace(e)}")
      return {
        "response" : "could not create account"
      }, 500

  @staticmethod
  @flask_ref.route('/verify/<string:registrationToken>', methods=['GET'])
  @http_logger
  def verify(registrationToken: str):
    try:
      LogFactory.MAIN_LOG.info("Is this a valid token?")
      if Services.dbQueryFactory.check_registration_token(registrationToken):

        LogFactory.MAIN_LOG.info("verify api")
        Services.dbQueryFactory.verify_account(registrationToken)
        return {
          "response" : "Account verified!"
        }
      else:
        return {
          "response": "Account could not be verified"
        }, 400
    except Exception as e:
      LogFactory.MAIN_LOG.error(f"Failed registering {errorStackTrace(e)}")
      return {
        "response" : "sadness"
      }, 500

