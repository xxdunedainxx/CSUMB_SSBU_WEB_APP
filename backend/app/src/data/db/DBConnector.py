"""
    Author: Zach McFadden
    Date: 2/16/26
    Synopsis: General DB connector
"""

import psycopg2
from psycopg2 import connection

from src.util.LogFactory import LogFactory


class DBConnector:

    # DB Connection object
    __CONNECTION: connection = None

    def __init__(self):
        pass

    def __initiate_connection(self, host: str, databaseName: str, username: str, password: str, port: int):
        self.__CONNECTION = psycopg2.connect(
            host=host,
            dbname=databaseName,
            user=username,
            password=password,
            port=port
        )

    def check_connection(self) -> bool:
        if self.__CONNECTION is not None:
            # '0' indicates the connection is open
            return self.__CONNECTION.closed == 0
        else:
            LogFactory.MAIN_LOG.error("Check connection failed because the connetion has not started")
            return False

    """
        TODO - Add guardrails for variable insertion.
    """
    def execute_query(self, query, vars=None):
        if self.check_connection() == False:
            raise Exception("DB Connection issue")
        else:
            queryCursor = self.__CONNECTION.cursor()

            queryCursor.execute(
                query,
                vars=vars
            )

            """
                Example for data commit: 
                    queryCursor.rowcount -- shows number of rows impacted by query 
                    cur.execute("INSERT INTO users (name) VALUES (%s) RETURNING id;", ('Alice',))
                    new_user_id = cur.fetchone()[0]
                    conn.commit()
            """
            return queryCursor.fetchall()

    def read_data(self, query, vars=None):
        pass

    def write_or_update_data(self, query, vars=None):
        pass