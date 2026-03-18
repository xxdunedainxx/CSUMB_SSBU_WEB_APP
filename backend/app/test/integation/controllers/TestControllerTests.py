"""
  Author: Zach McFadden
  Date: 3/18/26
  Synopsis: Int testing for example test controller
"""
from src.util.LogFactory import LogFactory
from test.util.decorators.Toggle import enabled
import requests
import unittest

@enabled
def test_controller_tests():
    LogFactory.MAIN_LOG.info(f"RUNNING TestController integration tests")
    unittest.main(module=__name__, exit=False)


class TestControllerTests(unittest.TestCase):

    @enabled
    def test_example_controller(self):
        testController = requests.get("http://localhost:80/test")

        assert(testController.status_code == 200)
        assert(testController.json()["response"] == "hello world")