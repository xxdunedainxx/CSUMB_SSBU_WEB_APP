from src.util.LogFactory import LogFactory
from src.util.ErrorFactory import errorStackTrace
from src.Setup import Setup
from src.threading.Cron import Cron
from src.data.redis.Queues.MailQueue import MailQueue
from src.WebServer.controllers.monitor.AppHealthStatuses import AppHealthStatus
from src.WebServer.controllers.monitor.AppHealthUtil import AppHealthStatusUtil
from src.Services import ServiceNames, Services
from src.Configuration import CONF_INSTANCE

class MailerJob:

  emailsPerJobExecution: int = CONF_INSTANCE.MAIL_JOB_EMAILS_PER_JOB
  mailQueue: MailQueue = None


  @staticmethod
  def mailer_job():
    Setup.setup()
    AppHealthStatusUtil.write_status(ServiceNames.mail, AppHealthStatus.BUSY)

    LogFactory.MAIN_LOG.info(f"scheduling mailer job for every {CONF_INSTANCE.MAIL_JOB_INTERVAL_MINUTES} minute(s)")
    Cron.run_every_x_minutes(MailerJob.mailer_sync, CONF_INSTANCE.MAIL_JOB_INTERVAL_MINUTES)
    AppHealthStatusUtil.write_status(ServiceNames.mail, AppHealthStatus.HEALTHY)
    MailerJob.mailQueue = Services.mailQueue
    Cron.execute_jobs()

  @staticmethod
  def check_mail_q() -> {}:
    LogFactory.MAIN_LOG.info(f"checking email q. checking {MailerJob.emailsPerJobExecution} for this check.")

    for i in range(MailerJob.emailsPerJobExecution):
      LogFactory.MAIN_LOG.info(f"[Check # {i}]..")
      data = MailerJob.mailQueue.check_queue()

      if data is None:
        LogFactory.MAIN_LOG.info("Nothing in queue. Exit loop")
        break
      else:
        # TODO - could turn this into a structured object
        emailType = data["emailType"]
        targetEmail = data["email"]
        subject = data["subject"]


        Services.smtpService.send_html_email(
          emailData=data,
          toEmail=targetEmail,
          subject=subject,
          emailBody="",
          formatter=emailType
        )

  @staticmethod
  def mailer_sync():
    LogFactory.MAIN_LOG.info('executing mailer sync')
    MailerJob.check_mail_q()