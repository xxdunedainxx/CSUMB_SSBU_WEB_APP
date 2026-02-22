"""
TODO - ADD YOUR OWN AUTHOR/DATE/SYNOPSIS

Author: Ishaya Iliya
Date: 2.18.2026
Synopsis: Class to detect and scrub PII from strings
"""

import re

class PIIDataScrubber:
    # Regex patterns
    SSN_PATTERN = r"\b\d{3}-\d{2}-\d{4}\b"
    PHONE_PATTERN = r"\b\d{3}-\d{3}-\d{4}\b|\(\d{3}\)\s?\d{3}-\d{4}"
    CREDIT_CARD_PATTERN = r"\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b"

    @staticmethod
    def does_contain_pii(data: str) -> bool:
        """Return True if the string contains SSN, phone number, or credit card"""
        patterns = [
            PIIDataScrubber.SSN_PATTERN,
            PIIDataScrubber.PHONE_PATTERN,
            PIIDataScrubber.CREDIT_CARD_PATTERN
        ]
        for pattern in patterns:
            if re.search(pattern, data):
                return True
        return False

    @staticmethod
    def scrub_pii(data: str) -> str:
        """Replace PII with '**REDACTED**'"""
        patterns = [
            PIIDataScrubber.SSN_PATTERN,
            PIIDataScrubber.PHONE_PATTERN,
            PIIDataScrubber.CREDIT_CARD_PATTERN
        ]
        scrubbed_data = data
        for pattern in patterns:
            scrubbed_data = re.sub(pattern, "**REDACTED**", scrubbed_data)
        return scrubbed_data

# Basic tests
if __name__ == "__main__":
    # Test contains PII
    assert(PIIDataScrubber.does_contain_pii('hello, my ssn is: 000-00-0000') == True)
    assert(PIIDataScrubber.does_contain_pii('hello world!') == False)

    # Test replacement
    assert(PIIDataScrubber.scrub_pii('hello world!') == 'hello world!')
    assert(PIIDataScrubber.scrub_pii('hello, my ssn is: 000-00-0000') == 'hello, my ssn is: **REDACTED**')

    # Phone tests
    assert(PIIDataScrubber.does_contain_pii('call me at 123-456-7890') == True)
    assert(PIIDataScrubber.scrub_pii('call me at 123-456-7890') == 'call me at **REDACTED**')

    # Credit card tests
    assert(PIIDataScrubber.does_contain_pii('card 1234 5678 9012 3456') == True)
    assert(PIIDataScrubber.scrub_pii('card 1234 5678 9012 3456') == 'card **REDACTED**')

    # Multiple PII
    assert(PIIDataScrubber.scrub_pii('ssn 123-45-6789 and phone 123-456-7890')
           == 'ssn **REDACTED** and phone **REDACTED**')
    
    assert(PIIDataScrubber.does_contain_pii('Hello my name is Maxwell') == False)
    assert(PIIDataScrubber.scrub_pii('Hello my name is Maxwell') == 'Hello my name is Maxwell')

    print("All tests passed!")