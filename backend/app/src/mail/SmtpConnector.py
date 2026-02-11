'''
Author: Carson Cardoza
Date: 2/4/26
Synopsis: Util class for sending SMTP emails
''' 

'''
Log: Carson 2/11/26
Currently this will take input of (subject, body, sender, recipients, password)
and use it to send a basic messsage. To add attachments I need to do more work 
on it but the basic framework is here now. We will need to make a Gmail account 
to use as our sender and we will likely need a way to secure the api key so
it doesnt get abused. We could just leave it open but I dont think its worth
the risk of having to make a whole new account. I have to work on some more homework
but I'm currently looking at MIMEBase documentation to hopefully use that.

Quick Update, Dude I literally just saw documentation for the Gmail API and
it might be easier to just use that and restart what I made already 😩
'''

#Resource Used: https://mailtrap.io/blog/python-send-email-gmail/#Send-email-in-Python-using-Gmail-SMTP
#Using SMTPlib Library we can set up the SMTP connector to send emails using Google SMTP to users
from smtplib import SMTP

#MIMEText will be used to actually fill the email fields with our "Email" object
from email.mime.text import MIMEText

#Resource used: https://docs.python.org/3/library/smtplib.html#smtplib.SMTP.sendmail
#Email Fields:
subject = "Email Subject"
body = "Email Body"
#This will need to be the "Sender" Google account email
sender = "sender@gmail.com"
recipients = [recipient1@gmail.com, recipient2@gmail.com]
#This will need to be the "Sender" Google account API key
password = "Password123"

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
    #Printing a message to the console for testing
    print("Message Sent")
#Calling the send mail function here
send_email(subject, body, sender, recipients, password)