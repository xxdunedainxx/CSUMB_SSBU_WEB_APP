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

    def enqueue(self, queue_name, value):
        return self.client.lpush(queue_name, value)

    def dequeue(self, queue_name):
        return self.client.rpop(queue_name)

    def queue_length(self, queue_name):
        return self.client.llen(queue_name)

    def dequeue_blocking(self, queue_name, timeout=0):
        # brpop returns (queue_name, value) on success; normalize to value or None
        result = self.client.brpop(queue_name, timeout=timeout)
        if result is None:
            return None
        return result[1]

    def flush_db(self):
        return self.client.flushdb()

    def close(self):
        # Close the connection
        self.client.close()