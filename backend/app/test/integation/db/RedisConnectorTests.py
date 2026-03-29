"""
  Author: Micah Heneveld
  Date: 3/29/26
  Synopsis: Int testing for Redis connector
"""

import unittest

from src.data.redis.RedisConnector import RedisConnector
from src.util.LogFactory import LogFactory
from test.util.decorators.Toggle import enabled

# Ensure the main logger is initialized for decorators/tests
LogFactory.main_log()


@enabled
def redis_connector_tests():
    LogFactory.MAIN_LOG.info("RUNNING Redis connection tests")
    unittest.main(module=__name__, exit=False)


class RedisConnectorTests(unittest.TestCase):

    def setUp(self):
        self.connector: RedisConnector = RedisConnector(
            host="localhost",
            port=6379,
            db=15
        )
        self.connector.flush_db()

    def tearDown(self):
        self.connector.flush_db()
        self.connector.close()

    @enabled
    def test_key_crud(self):
        key = "test:key:hello"

        self.connector.set_value(key, "world")
        self.assertEqual(self.connector.get_value(key), "world")

        self.connector.delete_value(key)
        self.assertIsNone(self.connector.get_value(key))

    @enabled
    def test_queue_ops(self):
        queue = "test:queue"

        self.connector.enqueue(queue, "msg1")
        self.connector.enqueue(queue, "msg2")

        self.assertEqual(self.connector.queue_length(queue), 2)
        self.assertEqual(self.connector.dequeue(queue), "msg1")
        self.assertEqual(self.connector.dequeue(queue), "msg2")
        self.assertEqual(self.connector.queue_length(queue), 0)

        self.assertIsNone(self.connector.dequeue_blocking(queue, timeout=1))


if __name__ == "__main__":
    unittest.main()
