"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: The API 'factory' is used to register controllers with the main flask server,
            and then run flask once those controllers are registered.
"""
from src.WebServer.WebServerInit import WebServerInit
from src.WebServer.controllers.monitor.AppHealth import AppHealthStatus
from src.WebServer.controllers.monitor.AppHealthUtil import AppHealthStatusUtil
from src.Configuration import CONF_INSTANCE
from src.Services import Services
from src.Setup import Setup

class APIFactory:

    instance = None

    def __init__(self, appHealthOnly=False):
        self.app_health_only=appHealthOnly

        WebServerInit.init_flask()
        if appHealthOnly == True:
            self.app_health_controller()
        else:
            AppHealthStatusUtil.write_status(Services.apiServer, AppHealthStatus.BUSY)
            self.prep_controllers()

    def app_health_controller(self):
        from src.WebServer.controllers.monitor.AppHealth import AppHealthController
        self.app_health: AppHealthController = AppHealthController()

    def prep_controllers(self):
        from src.WebServer.controllers.test.TestController import TestController
        from src.WebServer.controllers.toggle.ToggleController import ToggleController
        from src.WebServer.controllers.trial.TrialDataController import TrialController
        from src.WebServer.controllers.auth.AuthController import AuthController
        from src.WebServer.controllers.accountmgmt.AccountManagementController import AccountManagementController
        from src.WebServer.controllers.feedback.FeedbackController import FeedbackController

        self.test_controller: TestController = TestController()
        self.toggle_controller: ToggleController = ToggleController()
        self.trial_controller: TrialController = TrialController()
        self.auth_controller: AuthController = AuthController()
        self.account_management_controller: AccountManagementController = AccountManagementController()
        self.feedback_controller: FeedbackController = FeedbackController()


    def run(self, port: int = CONF_INSTANCE.FLASK_PORT_BIND):
        if self.app_health_only == False:
            AppHealthStatusUtil.write_status(Services.apiServer, AppHealthStatus.HEALTHY)

        WebServerInit.flask.run (
            host=CONF_INSTANCE.FLASK_HOST_BIND,
            port=port,
            debug=False,
        )

    @staticmethod
    def run_api_in_thread():
        Setup.setup()
        APIFactory.instance = APIFactory()
        APIFactory.instance.run()


    @staticmethod
    def run_app_health_thread():
        Setup.setup()
        APIFactory.instance = APIFactory(appHealthOnly=True)
        APIFactory.instance.run(
            port=CONF_INSTANCE.APP_HEALTH_PORT
        )