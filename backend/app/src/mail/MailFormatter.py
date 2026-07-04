"""
  Author: Zach McFadden
  Date: 7/3/26
  Synopsis: Mail formatter. Util class for formatting HTML Style emails
"""

import os
from src.util.FileIO import FileIO
from src.Configuration import CONF_INSTANCE

class MailTypes:
  FEEDBACK: str = "FEEDBACK"
  SERVER_IS_DOWN_EMAIL: str ="SERVER_IS_DOWN_EMAIL"
  DEPLOYMENT_EMAIL: str = "DEPLOYMENT_EMAIL"
  VERIFY: str = "VERIFY"

"""
  Base format class 
  TODO - OOP of this sucks ass right now 
"""
class MailFormatter:

  TEMPLATE_DIR=f"src{os.sep}mail{os.sep}html_templates"

  def __init__(self):
    pass


  """
    Base format html function 
  """
  def formatted_html(self) -> str:
    return ""

class FeedbackEmail(MailFormatter):

  def __init__(self,emailData: dict,  htmlTemplate: str = 'Feedback.html'):
    self.feedback: str = emailData["feedback"]
    self.template: str = htmlTemplate


  def formatted_html(self) -> str:
    cwd=os.getcwd()
    html_content = FileIO.read_file_content_to_string(f"./{MailFormatter.TEMPLATE_DIR}{os.sep}{self.template}") # open(f"{MailFormatter.TEMPLATE_DIR}{os.sep}{self.template}").read()
    html_content = html_content.replace(
      "$FEEDBACK",
      self.feedback
    )
    return html_content

class DeploymentFormatter(MailFormatter):

  def __init__(self,emailData: dict,  htmlTemplate: str = 'Deployment.html'):
    self.service_info: str = emailData["service_info"]
    self.hostname: str = emailData["hostname"]
    self.version: str = emailData["version"]
    self.template: str = htmlTemplate


  def formatted_html(self) -> str:
    cwd=os.getcwd()
    html_content = FileIO.read_file_content_to_string(f"./{MailFormatter.TEMPLATE_DIR}{os.sep}{self.template}") # open(f"{MailFormatter.TEMPLATE_DIR}{os.sep}{self.template}").read()
    html_content = html_content.replace(
      "$SERVICE_INFO",
      self.service_info
    )
    html_content = html_content.replace(
      "$HOST",
      self.hostname
    )
    html_content = html_content.replace(
      "$VERSION",
      self.version
    )

    return html_content

class VerifyEmailFormatter(MailFormatter):

  def __init__(self, emailData: {}, htmlTemplate: str = 'VerifyEmail.html'):
    self.emailData: {} = emailData
    self.template = htmlTemplate


  def formatted_html(self) -> str:
    cwd=os.getcwd()
    html_content = FileIO.read_file_content_to_string(f"./{MailFormatter.TEMPLATE_DIR}{os.sep}{self.template}") # open(f"{MailFormatter.TEMPLATE_DIR}{os.sep}{self.template}").read()
    html_content = html_content.replace(
      "$VERIFY",
      self.emailData["verifyLink"]
    )
    return html_content

FORMATTERS : dict  = {
  MailTypes.FEEDBACK : FeedbackEmail,
  MailTypes.DEPLOYMENT_EMAIL: DeploymentFormatter,
  MailTypes.VERIFY: VerifyEmailFormatter
}