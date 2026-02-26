"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: Container class for executing general startup setup steps
"""
from .util.LogFactory import LogFactory
# from .Configuration import CONF_INSTANCE

class Setup:
    def __init__(self):
        pass

    @staticmethod
    def setup():
        LogFactory.main_log()
        LogFactory.MAIN_LOG.info(f"Executing Application Setup!")
