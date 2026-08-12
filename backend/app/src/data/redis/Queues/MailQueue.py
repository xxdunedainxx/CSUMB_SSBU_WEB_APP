from src.util.LogFactory import LogFactory
from src.util.ErrorFactory import errorStackTrace
from src.data.redis.RedisConnector import RedisConnector

import json

class MailQueue:

    QUEUE_NAME = "MailQueue"

    def __init__(self, redisConnector: RedisConnector):
        self.redisConnector = redisConnector

    def check_queue(self):
        data = (self.redisConnector.dequeue(MailQueue.QUEUE_NAME))

        if data is None:
            return data
        else:
            return json.loads(data)

    def add_to_queue(self, emailType: str, data: {}):
        totalPacket = data
        totalPacket["emailType"] = emailType

        self.redisConnector.enqueue(
            MailQueue.QUEUE_NAME,
            json.dumps(totalPacket)
        )