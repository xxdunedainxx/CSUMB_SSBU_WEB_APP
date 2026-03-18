"""
  Author: TODO
  Date: TODO
  Synopsis: TODO
"""
from src.util.LogFactory import LogFactory
from test.util.decorators.Toggle import enabled
import requests
import unittest

@enabled
def test_toggle_controller():
    LogFactory.MAIN_LOG.info(f"RUNNING ToggleController integration tests")
    unittest.main(module=__name__, exit=False)

class ToggleControllerTests(unittest.TestCase):
    # TODO - ADD ALL TESTS YOU THINK WE SHOULD HAVE HERE.
    pass