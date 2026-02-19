"""
    Author: Zach McFadden
    Date: 2/16/26
    Synopsis: General DB connector.
        Currently supports: PostGres
"""
from typing import Any

import psycopg2

from src.util.LogFactory import LogFactory

"""
    Exception thrown for db connection issues 
"""
class CSUMBDatabaseConnectionError(Exception):
  def __init__(self, host: str, port: int):
    super().__init__(f"Failed to connect to the host: {host}:{port}")

"""
    Connetion wrapper for postgres databases.

    Example Usage:
    
      dbConnect: DBConnector = DBConnector(
        "localhost",
        "test",
        "postgres",
        "my-secret-pw",
        5432
      )
    
      dbConnect.write_or_update_data(
        "INSERT INTO test (id, data) VALUES (%s, %s)",
        vars=(1,"TEST")
      )
    
      records = dbConnect.read_data("SELECT * FROM test")
"""
class DBConnector:

    READ="READ"
    WRITE="WRITE"

    """
        Constructor will implicitly start the DB connection.
    """
    def __init__(self,host: str, databaseName: str, username: str, password: str, port: int):
        self.__CONNECTION = None
        self.host: str = ""
        self.port: int = -1

        self.__initiate_connection(
            host,
            databaseName,
            username,
            password,
            port
        )

    """
        Initializes a connection with target DB 
    """
    def __initiate_connection(self, host: str, databaseName: str, username: str, password: str, port: int):
        LogFactory.MAIN_LOG.info(f"Initializing DB connection with '{host}:{port}'")
        self.__CONNECTION = psycopg2.connect(
            host=host,
            dbname=databaseName,
            user=username,
            password=password,
            port=port
        )

        if self.check_connection() == False:
            raise CSUMBDatabaseConnectionError(host, port)
        else:
            LogFactory.MAIN_LOG.info(f"Connection with '{host}:{port}', successful!")
            self.host = host
            self.port = port

    """
        Check if the database connection is currently available. 
            - Returns false if connection is either not started, or if the DB is unavailable.
    """
    def check_connection(self) -> bool:
        if self.__CONNECTION is not None:
            # '0' indicates the connection is open
            return self.__CONNECTION.closed == 0
        else:
            LogFactory.MAIN_LOG.error("Check connection failed because the connetion has not started")
            return False

    """
        Main query execution function. this can be called directly or indirectly (via the write and read methods below as well).
        
        NOTE: If parameterized queries are NOT used, 
            ... the postgres client will (correctly) reject the query, in protection of SQL injection attacks.
    """
    def execute_query(self, query, vars=None, readOrWrite="") -> Any:
        LogFactory.MAIN_LOG.info(f"Executing query... {query}")
        if self.check_connection() == False:
            raise CSUMBDatabaseConnectionError(self.host, self.port)
        else:
            queryCursor = self.__CONNECTION.cursor()

            queryCursor.execute(
                query,
                vars=vars
            )

            # Commit the write
            if readOrWrite == DBConnector.WRITE:
                self.__CONNECTION.commit()
                # TODO - check commits
                return None
            else:
                return queryCursor.fetchall()

    """
        Simple helper for reading data from a db 
    """
    def read_data(self, query, vars=None) -> tuple:
        return self.execute_query(
            query,
            vars,
            readOrWrite=DBConnector.READ
        )

    """
        Simple helper for writing data to a db 
    """
    def write_or_update_data(self, query, vars=None) -> None:
        return self.execute_query(
            query,
            vars,
            readOrWrite=DBConnector.WRITE
        )