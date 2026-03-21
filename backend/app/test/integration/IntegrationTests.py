"""
  Author: Zach McFadden
  Date: 2/16/26
  Synopsis: INTEGRATION TESTING
"""
from src.util.LogFactory import LogFactory
from test.integration.db.DBConnectorTests import db_connector_tests
from test.integration.db.DBQueryFactoryTests import db_query_factory_tests
from test.integration.controllers.TestControllerTests import test_controller_tests
from test.integration.controllers.ToggleControllerTests import test_toggle_controller

class IntegrationTests:

    @staticmethod
    def run_integration_tests():
      LogFactory.MAIN_LOG.info('Running Integration tests!')
      db_connector_tests()
      db_query_factory_tests()
      test_controller_tests()
      test_toggle_controller()