"""
  Author: Kay Makinde-Odusola
  Date: 3/19/2026
  Synopsis: Integration tests for ToggleController
"""
from src.util.LogFactory import LogFactory
from test.util.decorators.Toggle import enabled
from src.WebServer.controllers.toggle.ToggleController import ToggleController
from src.toggle.Toggle import ToggleService
import requests
import unittest

@enabled
def test_toggle_controller():
    LogFactory.MAIN_LOG.info(f"RUNNING ToggleController integration tests")
    unittest.main(module=__name__, exit=False)

class ToggleControllerTests(unittest.TestCase):
    @enabled
    def test_all_toggles(self):
        toggle_file = ToggleService("src/WebServer/controllers/toggle/Toggles.json")
        test_request = requests.get("http://localhost:80/api/v1/toggles")
        assert(test_request.status_code == 200)
        assert(test_request.json() == toggle_file.get_toggles())

    @enabled
    def test_specific_toggle(self):
        test_request = requests.get("http://localhost:80/api/v1/toggles/example_toggle")
        assert(test_request.status_code == 200)
        assert(test_request.json()["example_toggle"] == True)

    @enabled
    def test_bad_toggle(self):
        test_request = requests.get("http://localhost:80/api/v1/toggles/bad_toggle")
        assert(test_request.status_code == 404)

