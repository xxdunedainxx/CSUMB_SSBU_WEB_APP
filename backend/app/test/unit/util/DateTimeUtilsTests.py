"""
  Author: Zach McFadden
  Date: 2/24/26
  Synopsis: Unit testing for DateTimeUtils class
"""
from src.util.DateTimeUtil import DateTimeUtils
from src.util.LogFactory import LogFactory
from test.util.decorators.Toggle import enabled

import unittest

@enabled
def date_time_utils_tests():
    LogFactory.MAIN_LOG.info(f"RUNNING DateTimeUtils tests")
    unittest.main(module=__name__, exit=False)

class DateTimeUtilsTests(unittest.TestCase):

    @enabled
    def test_get_current_time_and_convert(self):
        currentTimeString = DateTimeUtils.get_current_datetime_in_iso_format_str()

        # Convert it BACK to datetime
        currentTimeDateTimeObject= DateTimeUtils.convert_str_to_iso_datetime(currentTimeString)

        assert(currentTimeString == currentTimeDateTimeObject.strftime(DateTimeUtils.ISO_FORMAT))

    @enabled
    def test_conversion_pg_dt_string_to_iso_datetime(self):
        examplePGDateTimeStr='2026-02-24 16:23:16.015582+00:00'
        convertToISODT=DateTimeUtils.convert_pg_time_to_iso(examplePGDateTimeStr)
        assert(str(convertToISODT) == "2026-02-24 16:23:16.015582+00:00")

if __name__ == "__main__":
    unittest.main()