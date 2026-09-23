# Data validation (ex email validation)
"""
  Author: Kay Makinde-Odusola
  Date: 2/9/26
  Synopsis: Used to test the validity of emails
"""


from inspect import signature

from email_validator import validate_email, EmailNotValidError

from src.data.db.model.GngTestResult import GngTestResult
from src.data.db.model.PosnerCueResult import PosnerCueResult
from src.data.db.model.SrtTestResult import SrtTestResult
from src.data.db.model.TaskSwitchingResult import TaskSwitchingResults


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

# TODO -
class DataModelValidation:

    @staticmethod
    def validate_gng_structure(gngRecord: GngTestResult) -> bool:
        # checks if test structure is correct
        expected_fields = list(signature(GngTestResult.__init__).parameters)[1:]
        actual_fields = list(vars(gngRecord).keys())
        return sorted(actual_fields) == sorted(expected_fields)

    @staticmethod
    def validate_posner_structure(posnerRecord: PosnerCueResult) -> bool:
        # checks if test structure is correct
        expected_fields = list(signature(PosnerCueResult.__init__).parameters)[1:]
        actual_fields = list(vars(posnerRecord).keys())
        return sorted(actual_fields) == sorted(expected_fields)

    _SRT_FIELD_VALIDATORS = {
        "id": lambda v: isinstance(v, int),
        "testResultId": lambda v: isinstance(v, int),
        "TestOrTraining": lambda v: isinstance(v, str),
        "TrainingOrReal": lambda v: v in (0, 1),
        "NumberOfChoices": lambda v: v in (1, 4),
        "TimeBetweenResponseAndNextTrial": lambda v: isinstance(v, int) and 1000 <= v <= 3000,
        "XCoordinateTargetStim": lambda v: isinstance(v, int) and v >= 0,
        "ResponseTimeMs": lambda v: isinstance(v, int) and v >= 0,
        "StatusOfAnswer": lambda v: v in (1, 2, 3),
    }

    @staticmethod
    def validate_srt_structure(srtRecord: SrtTestResult) -> bool:
        # checks if test structure is correct
        expected_fields = list(signature(SrtTestResult.__init__).parameters)[1:]
        actual_fields = list(vars(srtRecord).keys())

        if sorted(actual_fields) != sorted(expected_fields):
            return False

        return all(
            DataModelValidation._SRT_FIELD_VALIDATORS[field](getattr(srtRecord, field))
            for field in actual_fields
        )

    @staticmethod
    def validate_taskSwitching_structure(task: TaskSwitchingResults) -> bool:
        expected_fields = list(signature(TaskSwitchingResults.__init__).parameters)[1:]
        actual_fields = list(vars(task).keys())
        return sorted(actual_fields) == sorted(expected_fields)
