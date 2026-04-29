"""
  Author: Zach McFadden
  Date: 2/2/26
  Synopsis: Unit testing entry point. Place all relevant unit tests here :)
"""
from src.util.LogFactory import LogFactory
from test.unit.util.RandomNumberGeneratorUnitTesting import random_number_generation_tests
from test.unit.util.FileIOUnitTests import file_io_unit_tests
from test.unit.util.test_email import test_emails
from test.unit.util.DateTimeUtilsTests import date_time_utils_tests
from test.unit.sec.PIIDataScrubberUnitTests import pii_data_scrubber_tests
from test.unit.sec.CryptoServiceUnitTests import crypto_service_unit_testing

from test.unit.util.ToggleTests.test_toggles import test_togglers

class UnitTests:

  @staticmethod
  def run_unit_tests():
    LogFactory.MAIN_LOG.info('Running Unit tests!')
    random_number_generation_tests()
    file_io_unit_tests()
    test_emails()
    date_time_utils_tests()
    pii_data_scrubber_tests()
    test_togglers()
    crypto_service_unit_testing()

