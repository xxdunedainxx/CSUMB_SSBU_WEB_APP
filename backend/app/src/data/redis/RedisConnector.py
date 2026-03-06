# Redis connector, used for queues like email queues 
import redis

class RedisConnector:
    def __init__(self, host='localhost', port=6379, db=0):
        # Connect the client
        self.client = redis.Redis(host=host, port=port, db=db, decode_responses=True)

    def set_value(self, key, value):
        return self.client.set(key, value)

    def get_value(self, key):
        return self.client.get(key)

    def delete_value(self, key):
        return self.client.delete(key)

    def close(self):
        # Close the connection
        self.client.close()