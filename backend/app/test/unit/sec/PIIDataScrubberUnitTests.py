"""
    Author: Ishaya Iliya
    Date: 2.18.2026
    Synopsis: Class to detect and scrub PII from strings
"""

from src.sec.PIIDataScrubber import PIIDataScrubber
from src.util.LogFactory import LogFactory

from test.util.decorators.Toggle import enabled

import unittest

@enabled
def pii_data_scrubber_tests():
    LogFactory.MAIN_LOG.info(f"RUNNING PII scrubber tests")
    unittest.main(module=__name__, exit=False)

class PIIDataScrubberTests(unittest.TestCase):

    @enabled
    def test_contains_pii(self):
        # Test contains PII
        assert (PIIDataScrubber.does_contain_pii('hello, my ssn is: 000-00-0000') == True)
        assert (PIIDataScrubber.does_contain_pii('hello world!') == False)

    @enabled
    def test_pii_replace(self):
        # Test replacement
        assert (PIIDataScrubber.scrub_pii('hello world!') == 'hello world!')
        assert (PIIDataScrubber.scrub_pii('hello, my ssn is: 000-00-0000') == 'hello, my ssn is: **REDACTED**')

    @enabled
    def test_pii_phone_number(self):
        # Phone tests
        assert (PIIDataScrubber.does_contain_pii('call me at 123-456-7890') == True)
        assert (PIIDataScrubber.scrub_pii('call me at 123-456-7890') == 'call me at **REDACTED**')

    @enabled
    def test_pii_credit_cards(self):
        # Credit card tests
        assert (PIIDataScrubber.does_contain_pii('card 1234 5678 9012 3456') == True)
        assert (PIIDataScrubber.scrub_pii('card 1234 5678 9012 3456') == 'card **REDACTED**')

    @enabled
    def test_pii_multiple_instances_scrubbing(self):
        # Multiple PII
        assert (PIIDataScrubber.scrub_pii('ssn 123-45-6789 and phone 123-456-7890')
                == 'ssn **REDACTED** and phone **REDACTED**')

    @enabled
    def test_pii_no_op(self):
        assert (PIIDataScrubber.does_contain_pii('Hello my name is Maxwell') == False)
        assert (PIIDataScrubber.scrub_pii('Hello my name is Maxwell') == 'Hello my name is Maxwell')


if __name__ == "__main__":
    unittest.main()
