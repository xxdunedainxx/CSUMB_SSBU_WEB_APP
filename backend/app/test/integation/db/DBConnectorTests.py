"""
  Author: Zach McFadden
  Date: 2/2/26
  Synopsis: Int testing for DB connector
"""
from src.data.db.DBConnector import DBConnector
from src.util.LogFactory import LogFactory

from test.util.decorators.Toggle import enabled

import unittest

@enabled
def db_connector_tests():
    LogFactory.MAIN_LOG.info(f"RUNNING DB connection tests tests")
    unittest.main(module=__name__, exit=False)


class DBConnectorTests(unittest.TestCase):

    @enabled
    def test_simple_connect_and_insert(self):
        dbConnect: DBConnector = DBConnector(
            "localhost",
            "test",
            "postgres",
            "my-secret-pw",
            5432
        )

        # Cleanup the table
        dbConnect.execute_query("TRUNCATE TABLE simpleTestDataOne", readOrWrite=DBConnector.WRITE)

        records = dbConnect.read_data("SELECT * FROM simpleTestDataOne")
        print(len(records))
        assert (len(records) == 0)

        dbConnect.write_or_update_data(
            "INSERT INTO simpleTestDataOne (id, data) VALUES (%s, %s)",
            vars=(1, "TEST")
        )

        records = dbConnect.read_data("SELECT * FROM simpleTestDataOne")
        print(len(records))
        assert (len(records) == 1)

if __name__ == "__main__":
    unittest.main()
