"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: The API 'factory' is used to register controllers with the main flask server,
            and then run flask once those controllers are registered.
"""
from src.WebServer.WebServerInit import WebServerInit
from src.Configuration import CONF_INSTANCE

class APIFactory:

    instance = None

    def __init__(self):

        WebServerInit.init_flask()
        self.prep_controllers()

    def prep_controllers(self):
        from src.WebServer.controllers.test.TestController import TestController
        self.test_controller: TestController = TestController()


    def run(self, port: int = CONF_INSTANCE.FLASK_PORT_BIND):

        WebServerInit.flask.run (
            host=CONF_INSTANCE.FLASK_HOST_BIND,
            port=port,
            debug=False,
        )

    @staticmethod
    def run_api_in_thread():
        APIFactory.instance = APIFactory()
        APIFactory.instance.run()
