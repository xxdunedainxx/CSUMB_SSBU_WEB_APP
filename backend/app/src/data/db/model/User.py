"""
    Author: Zach McFadden
    Date: 2/17/26
    Synopsis: Basic user model object

    User model Object, ref SQL model:

        email VARCHAR(1000) NOT NULL,
        password VARCHAR(1000) NOT NULL,
        salt VARCHAR(100) NOT NULL,
        verified BOOLEAN NOT NULL,
        whenCreated DATE,
        lastLogin DATE,
"""
import datetime

class User:
    def __init__(self,
         id: int,
         email: str,
         password: str,
         salt: str,
         verified: bool,
         whenCreated: datetime.datetime,
         lastLogin: datetime.datetime
    ):
        self.id = id
        self.email = email
        self.password = password
        self.salt = salt
        self.verified = verified
        self.whenCreated = whenCreated
        self.lastLogin = lastLogin