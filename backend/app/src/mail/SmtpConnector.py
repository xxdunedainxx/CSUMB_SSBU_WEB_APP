'''
Author: Carson Cardoza
Date: 2/4/26
Synopsis: Util class for sending emails

Currently this will take input of (subject, body, sender, recipients, password)
and use it to send a basic messsage. 
To add attachments I need to do more work but the basic framework is here. 
We will need to make a Gmail account to use as our sender and we will likely 
need a way to secure the credentials.
'''

#Resource Used: https://mailtrap.io/blog/python-send-email-gmail/#Send-email-in-Python-using-Gmail-SMTP
#Using SMTPlib Library we can set up the SMTP connector to send emails using Google SMTP to users
import smtplib
from smtplib import SMTP

#MIMEText will be used to actually fill the email fields with our "Email" object
import email
from email.mime.text import MIMEText

#Resource used: https://docs.python.org/3/library/smtplib.html#smtplib.SMTP.sendmail

#Email Functions:
def send_email(subject, body, sender, recipients, password):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    #Creates a list of recipients seperated by commas
    msg['To'] = ', '.join(recipients)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
        smtp_server.login(sender, password)
        smtp_server.sendmail(sender, recipients, msg.as_string())

#Testing email function
if __name__ == "__main__":
    #Email Fields:
    subject = "Email Subject"
    body = "Email Body"
    #This will need to be the "Sender" Google account email
    sender = "sender@gmail.com"
    recipients = ["recipient1@gmail.com", "recipient2@gmail.com"]
    #This will need to be the "Sender" Google account API key
    password = "Password123"
    #Calling the send mail function here
    send_email(subject, body, sender, recipients, password)
    #Printing a message to the console for testing
    print("Message Sent")