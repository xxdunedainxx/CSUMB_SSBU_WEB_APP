"""
  Author: Zach McFadden
  Date: 2/7/26
  Synopsis: Testing framework entry point. 
"""
from src.util.FileIO import FileIO
from src.util.LogFactory import LogFactory
from test.util.TestToggles import TEST_CONF
from test.unit.UnitTests import UnitTests
from test.util.decorators.Toggle import TestMetrics

def unit():
  if TEST_CONF.UNIT_ENABLED():
    LogFactory.MAIN_LOG.info(f"Unit Test Toggle: {TEST_CONF.UNIT_TESTING_ENABLED}")
    UnitTests.run_unit_tests()
  else:
    LogFactory.MAIN_LOG.info("UNIT TESTS DISABLED")


def test():
  try:
    # Debug/verbose logging for all info
    LogFactory.log_level = 'DEBUG'
    # Remove local testing log
    FileIO.delete_file("testing.log")
    # Create main testing log file
    LogFactory.MAIN_LOG = LogFactory.get_logger(f"testing", stdOutOnly=False)


    LogFactory.MAIN_LOG.info('====== START TEST RUNNER ======')
    # Unit testing, will be skipped if not toggled on 
    unit()
    LogFactory.MAIN_LOG.info('====== END TEST RUNNER ======')
    TestMetrics.report()
  except Exception as e:
    LogFactory.MAIN_LOG.error(f"!!TESTS FAILED!!")
    exit(1)

if __name__ == "__main__":
  test()