"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: Application startup logic
"""
from src.Configuration import Configuration, CONF_INSTANCE
from src.WebServer.APIFactory import APIFactory
from src.util.LogFactory import LogFactory
from src.threading.ThreadPool import WorkerPool
from src.threading.jobs.MailerJob import MailerJob
from src.mail.MailFormatter import MailTypes
from src.Services import Services
from src.util.ErrorFactory import errorStackTrace
from src.WebServer.controllers.monitor.AppHealthUtil import AppHealthStatusUtil
from .Setup import Setup
from .threading.jobs.MetricsJob import MetricsJob


class App:

  conf: Configuration = None

  def __init__(self):
    self.conf: Configuration = CONF_INSTANCE

  def run(self):
    Setup.setup()
    self.init_app_health()
    self.init_api_thread()
    self.init_smtp_mailer_job()
    self.init_metrics_job()
    if CONF_INSTANCE.PRODUCTION_ENVIRONMENT:
      self.email_on_production_deployment()

  def email_on_production_deployment(self):
    try:
      LogFactory.MAIN_LOG.info("production deployment, sending email...")
      service_info: str = AppHealthStatusUtil.get_all_services_html_formatted()
      Services.smtpService.send_html_email(
        emailData={
          "service_info": service_info,
          "hostname" : CONF_INSTANCE.ENVIRONMENT_HOSTNAME,
          "version" : CONF_INSTANCE.VERSION
        },
        toEmail=CONF_INSTANCE.DEPLOY_EMAIL_LIST,
        subject="CSUMB Smash Site Deployed",
        emailBody="",
        formatter=MailTypes.DEPLOYMENT_EMAIL
      )
    except Exception as e:
      LogFactory.MAIN_LOG.error(f"Failed to email prod deploy info with error {errorStackTrace(e)}")


  def init_app_health(self):
    LogFactory.MAIN_LOG.info("Spinning up App Health Web Service")
    self.app_info_worker: WorkerPool = WorkerPool(
      poolName="app_info",
      size=1,
      poolType='default',
      targetMethod=APIFactory.run_app_health_thread
    )

    self.app_info_worker.run()

  def init_api_thread(self):
    LogFactory.MAIN_LOG.info("Spinning up API")
    self.api_worker: WorkerPool = WorkerPool(
      poolName=Services.apiServer,
      size=1,
      poolType='default',
      targetMethod=APIFactory.run_api_in_thread
    )

    self.api_worker.run()

  def init_smtp_mailer_job(self):
    LogFactory.MAIN_LOG.info("Init SMTP Mailer Job")
    self.smtp_mailer_worker: WorkerPool = WorkerPool(
      poolName=Services.mail,
      size=1,
      poolType="default",
      targetMethod=MailerJob.mailer_job
    )

    self.smtp_mailer_worker.run()

  def init_metrics_job(self):
    LogFactory.MAIN_LOG.info("Init metrics Job")

    self.metrics_worker: WorkerPool = WorkerPool(
      poolName=Services.metrics,
      size=1,
      poolType="default",
      targetMethod=MetricsJob.metrics_job
    )

    self.metrics_worker.run()