# Main application startup logic
from src.Configuration import Configuration, CONF_INSTANCE
from src.WebServer.APIFactory import APIFactory

class App:

  conf: Configuration = None

  def __init__(self):
    self.conf: Configuration = CONF_INSTANCE

  # TODO
  def run(self):
    APIFactory.run_api_in_thread()
