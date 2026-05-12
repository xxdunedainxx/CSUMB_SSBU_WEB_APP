# Data validation (ex email validation)
"""
  Author: Kay Makinde-Odusola
  Date: 2/9/26
  Synopsis: Used to test the validity of emails
"""


from email_validator import validate_email, EmailNotValidError

from src.data.db.model.GngTestResult import GngTestResult
from src.data.db.model.PosnerCueResult import PosnerCueResult

class Email:
    def __init__(self):
        pass
    @staticmethod
    def verify_email(email:str) -> bool:
        try:
            # check_deliverability checks if you can send emails to the domain
            test = validate_email(email, check_deliverability=False, allow_smtputf8=False)
            return True

        except EmailNotValidError as e:
            # print(str(e))
            return False

# TODO
class DataModelValidation:


    @staticmethod
    def validate_gng_structure(gngRecord: GngTestResult) -> bool:
        return True

    @staticmethod
    def validate_posner_structure(posnerRecord: PosnerCueResult) -> bool:
        return True

    @staticmethod
    def validate_srt_structure() -> bool:
        return True