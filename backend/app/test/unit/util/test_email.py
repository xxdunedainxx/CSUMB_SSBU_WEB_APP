"""
  Author: Kay Makinde-Odusola
  Date: 2/7/26
  Synopsis: Unit testing for emails
"""

from src.sec.DataValidation import Email
from src.util.LogFactory import LogFactory
from test.util.decorators.Toggle import enabled
from typing import List
import unittest
# "email@123.123.123.123",

# LogFactory.main_log()
GOOD_EMAILS: List[str] = [
  "i@g.com",
  "someone@aol.com",
  "someelse@gmail.com",
  "somethingfsjkldajsgadhgladslfhdsafadsf@hotmail.com",
  "email@example.com",
  "firstname.lastname@example.com",
  "email@subdomain.example.com",
  "firstname+lastname@example.com",
  "1234567890@example.com",
  "email@example-one.com",
  "_______@example.com",
  "email@example.name",
  "email@example.museum",
  "email@example.co.jp",
  "firstname-lastname@example.com"
]
BAD_EMAILS: List[str] = [
  "fdasfdasfas",
  "@fad@@@fadsfsadfasd",
  "@@@@@@",
  ".com",
  "plainaddress",
  "#@%^%#$@#$@#.com",
  "@example.com",
  "Joe Smith <email@example.com>",
  "email.example.com",
  "email@example@example.com",
  ".email@example.com",
  "email.@example.com",
  "email..email@example.com",
  "あいうえお@example.com",
  "email@example.com (Joe Smith)",
  "email@example",
  "email@-example.com",
  "email@example..com",
  "Abc..123@example.com"
]


@enabled
def test_emails():
    LogFactory.MAIN_LOG.info(f"RUNNING email tests")
    unittest.main(module=__name__, exit=False)


class TestEmail(unittest.TestCase):

    @enabled
    #checks for an invalid email in a list of valid emails
    def test_good_emails(self) -> bool:
        test = True
        print("Good Emails Test")
        for email in GOOD_EMAILS:
            if not Email.verify_email(email):
                print(email)
                test = False
        assert test == True

    @enabled
    # checks for a valid email in a list where its only supposed to have invalid emails
    def test_bad_emails(self) -> bool:
        test = False
        print('Bad Emails Test')
        for email in BAD_EMAILS:
            if Email.verify_email(email):
                test = True
        assert test == False

if __name__ == "__main__":
    unittest.main()
