"""
  Author: Zach McFadden
  Date: 2/16/26
  Synopsis: INTEGRATION TESTING
"""
from src.util.LogFactory import LogFactory
from test.integation.db.DBConnectorTests import db_connector_tests


class IntegrationTests:

    @staticmethod
    def run_integration_tests():
      LogFactory.MAIN_LOG.info('Running Integration tests!')
      db_connector_tests()