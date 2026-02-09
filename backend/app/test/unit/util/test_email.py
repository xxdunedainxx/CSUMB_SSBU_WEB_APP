import pytest
from src.sec.EmailTest import Email


class TestEmail:
    def __int__(self):
        pass

    def test_one(self):
        assert Email.verify_email("xxx@gmail.com") == True

    def test_two(self):
        assert Email.verify_email("kay@gmail-com") == False
