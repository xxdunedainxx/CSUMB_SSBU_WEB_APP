"""
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

    # list of patterns
    patterns = [
        SSN_PATTERN,
        PHONE_PATTERN,
        CREDIT_CARD_PATTERN
    ]

    @staticmethod
    def does_contain_pii(data: str) -> bool:
        """Return True if the string contains SSN, phone number, or credit card"""
        for pattern in PIIDataScrubber.patterns:
            if re.search(pattern, data):
                return True
        return False

    @staticmethod
    def scrub_pii(data: str) -> str:
        """Replace PII with '**REDACTED**'"""
        scrubbed_data = data
        for pattern in PIIDataScrubber.patterns:
            scrubbed_data = re.sub(pattern, "**REDACTED**", scrubbed_data)
        return scrubbed_data
