from src.data.db.DbQueryFactory import DbQueryFactory
from src.data.db.model import TaskSwitchingResult
from src.data.db.model.CompleteTestResults import CompleteTestResults
from src.data.db.model.GngTestResult import GngTestResult
from src.data.db.model.PosnerCueResult import PosnerCueResult
from src.data.db.model.ServerInfo import ServerInfo
from src.data.db.model.SrtTestResult import SrtTestResult
from src.data.db.model.TestResult import TestResult
from src.data.db.model.UserMetrics import UserMetrics
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

  # TODO - run calculations
  @staticmethod
  def calculate_impulse_score(gngResults: [GngTestResult]) -> int:
    return 0

  @staticmethod
  def calculate_srt_avg(srtResults: [SrtTestResult]) -> int:
    return 0

  @staticmethod
  def calculate_multi_task_score(taskSwitchResults: [TaskSwitchingResult]) -> int:
    return 0

  @staticmethod
  def calculate_attentional_score(posnerResults: [PosnerCueResult]) -> int:
    return 0

  @staticmethod
  def compute_user_metrics(userId: int):
    LogFactory.MAIN_LOG.info(f"Re-computing user metrics for {userId}")

    # Check if their metrics exist, if not create a placeholder metrics entry
    existingMetrics = MetricsJob.dbQueryFactory.get_user_metrics(userId)

    if existingMetrics == None:
      LogFactory.MAIN_LOG.info("Create new entry in metrics for user")
      existingMetrics=UserMetrics(
        id=0,
        userId=userId,
        lastUpdate=datetime.datetime.now(),
        payload={}
      )
      MetricsJob.dbQueryFactory.create_user_metrics(existingMetrics)

    # Get all Gng, posner, task switching, srt, and controller related data
    allTestId=Services.dbQueryFactory.get_all_user_test_result_ids(userId=userId)

    gngResults=[]
    posnerResults=[]
    srtResults=[]
    taskSwitchResults=[]
    controllerResults=[]

    for testId in allTestId:
      result: CompleteTestResults=Services.dbQueryFactory \
                .get_test_results(testId=testId,userId=userId)
      # TODO - need to improve these db structure because this SUCKS
      if result.testResult.classification == TestResult.SRT:
        srtResults.append(result.srt)
      elif result.testResult.classification == TestResult.POSNER_TYPE:
        posnerResults.append(result.posner)
      elif result.testResult.classification == TestResult.TASK_SWITCHING:
        taskSwitchResults.append(result.taskSwitch)
      elif result.testResult.classification == TestResult.GNG_TYPE:
        gngResults.append(result.gngTestResults)

    # Calculate: Impulsivity score, reaction time score, multi-tasking score, attention score
    impulseScore=MetricsJob.calculate_impulse_score(gngResults)
    multiTask=MetricsJob.calculate_multi_task_score(taskSwitchResults)
    attentionScore=MetricsJob.calculate_attentional_score(posnerResults)
    reactionScore=MetricsJob.calculate_srt_avg(srtResults)

    # Update them
    existingMetrics.payload={
      "impulseScore": impulseScore,
      "multiTaskScore": multiTask,
      "attentionScore": attentionScore,
      "reactionScore": reactionScore
    }

    # Update metrics in the db
    MetricsJob.dbQueryFactory.update_user_metrics(existingMetrics)

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