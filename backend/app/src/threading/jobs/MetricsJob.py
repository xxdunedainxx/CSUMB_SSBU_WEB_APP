from src.data.db.DbQueryFactory import DbQueryFactory
from src.data.db.model.ServerInfo import ServerInfo
from src.util.LogFactory import LogFactory
from src.util.ErrorFactory import errorStackTrace
from src.Setup import Setup
from src.threading.Cron import Cron
from src.WebServer.controllers.monitor.AppHealthStatuses import AppHealthStatus
from src.WebServer.controllers.monitor.AppHealthUtil import AppHealthStatusUtil
from src.Services import ServiceNames, Services
from src.Configuration import CONF_INSTANCE
import datetime

class MetricsJob:

  dbQueryFactory: DbQueryFactory

  @staticmethod
  def metrics_job():
    Setup.setup()
    AppHealthStatusUtil.write_status(ServiceNames.metricsJob, AppHealthStatus.BUSY)
    MetricsJob.dbQueryFactory = Services.dbQueryFactory
    LogFactory.MAIN_LOG.info(f"scheduling metrics job for every {CONF_INSTANCE.METRICS_JOB_INTERVAL_MINUTES} minute(s)")
    Cron.run_every_x_minutes(MetricsJob.metrics_job_run, CONF_INSTANCE.METRICS_JOB_INTERVAL_MINUTES)
    AppHealthStatusUtil.write_status(ServiceNames.metricsJob, AppHealthStatus.HEALTHY)
    Cron.execute_jobs()

  @staticmethod
  def compute_user_metrics(userId: int):
    LogFactory.MAIN_LOG.info(f"Re-computing user metrics for {userId}")

    # TODO --
    # Check if their metrics exist, if not create a placeholder metrics entry

    # Get all Gng, posner, task switching, srt, and controller related data

    # Calculate: Impulsivity score, reaction time score, multi-tasking score, attention score

    # Update metrics in the db

  @staticmethod
  def update_metrics() -> {}:
    LogFactory.MAIN_LOG.info(f"Metrics Job check")

    serverInfo: ServerInfo = MetricsJob.dbQueryFactory.get_server_info()

    # Get tests that have been updated since the last sync that was run based on server info
    tests=MetricsJob.dbQueryFactory.get_test_results_since_server_time(serverInfo)

    if len(tests) > 0:
      LogFactory.MAIN_LOG.info("NEW TEST RECORDS TO COMPUTE")
      usersComputed=[]
      for test in tests:
        LogFactory.MAIN_LOG.info(f"Check test {test}")

        if test.userId in usersComputed:
          LogFactory.MAIN_LOG.info("Skip user, already computed metrics")
        else:
          usersComputed.append(test.userId)
          MetricsJob.compute_user_metrics(test.userId)



    serverInfo.lastMetricsUpdate = datetime.datetime.now()

    LogFactory.MAIN_LOG.info(f"Update server info with last sync time: {serverInfo.lastMetricsUpdate}")

    MetricsJob.dbQueryFactory.update_server_info(
      serverInfo
    )



  @staticmethod
  def metrics_job_run():
    LogFactory.MAIN_LOG.info('executing metrics job')
    MetricsJob.update_metrics()