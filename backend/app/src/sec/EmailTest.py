from email_validator import validate_email, EmailNotValidError

class Email:
    def __init__(self):
        pass
    @staticmethod
    def verify_email(email:str) -> bool:
        try:
            # check_deliverability checks if you can send emails to the domain
            test = validate_email(email, check_deliverability=False)
            return True

        except EmailNotValidError as e:
            print(str(e))
            return False

