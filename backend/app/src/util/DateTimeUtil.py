"""
  Author: Zach McFadden
  Date: 2/24/26
  Synopsis: Simple utility class for managing date time related functions in a central place
"""

from datetime import datetime, timezone

class DateTimeUtils:

    ISO_FORMAT="%Y-%m-%dT%H:%M:%S.%fZ"

    # Only use static methods, no class object needed
    def __init__(self):
        pass

    """
        Gets current time, in ISO format and encodes to string
    """
    @staticmethod
    def get_current_datetime_in_iso_format_str() -> str:
        current_datetime_utc = datetime.now(timezone.utc)

        return current_datetime_utc.strftime(DateTimeUtils.ISO_FORMAT)

    @staticmethod
    def convert_str_to_iso_datetime(dateTimeStr: str):
        return datetime.strptime(dateTimeStr, DateTimeUtils.ISO_FORMAT)

    @staticmethod
    def convert_pg_time_to_iso(dateTimeStr: str):
        return datetime.fromisoformat(dateTimeStr)