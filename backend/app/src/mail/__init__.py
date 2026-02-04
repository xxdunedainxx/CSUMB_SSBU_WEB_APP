'''
Author: Carson Cardoza
Date: 2/4/26
Synopsis: Backend SMTP Server in Python
'''

#Using SMTPlib Library we can set up the SMTP server to send emails to users
from smtplib import SMTP

#This method will be used to actually send messages across this protocol
    #Resource used: https://docs.python.org/3/library/smtplib.html#smtplib.SMTP.sendmail

from_addr
to_addrs
msg
mail_options=()
rcpt_options=()

#SMTP.sendmail(from_addr, to_addrs, msg, mail_options=(), rcpt_options=())

#Exceptions to handle:
    #SMTPRecipientsRefused
        #All recipients were refused. Nobody got the mail.
    #SMTPHeloError
        #The server didn’t reply properly to the HELO greeting.
    #SMTPSenderRefused
        #The server didn’t accept the from_addr.
    #SMTPDataError
        #The server replied with an unexpected error code (other than a refusal of a recipient).
    #SMTPNotSupportedError
        #SMTPUTF8 was given in the mail_options but is not supported by the server.

#Backup in case headers and other info are included in the message itself
#SMTP.send_message(msg, from_addr=None, to_addrs=None, mail_options=(), rcpt_options=())