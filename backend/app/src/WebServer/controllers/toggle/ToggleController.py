from src.util.LogFactory import LogFactory
from src.WebServer.decorators.HTTPLogger import http_logger
from src.WebServer.WebServerInit import WebServerInit
from src.toggle.Toggle import ToggleService
from flask import Flask, jsonify

flask_ref: Flask = WebServerInit.flask

class ToggleController:
    def __init__(self):
        LogFactory.main_log()
        LogFactory.MAIN_LOG.info('Starting ToggleController')
        self.toggle_file = ToggleService("src/WebServer/controllers/toggle/Toggles.json")

    @http_logger
    def get_toggles(self):
        return self.toggle_file.get_toggles()

    @http_logger
    def index(self, toggle_name: str):
        if toggle_name is None or toggle_name not in self.toggle_file.get_toggles():
            return {}, 404
        test = {
            toggle_name: self.toggle_file.is_toggle_enabled(toggle_name)
        }
        return jsonify(test)


controller = ToggleController()
# in order to get the toggles, an instance of the class needs to be passed through to avoid status code 500
# so when either endpoints are hit, it calls view_func which passes the controller instance
flask_ref.add_url_rule("/api/v1/toggles", view_func=controller.get_toggles)
flask_ref.add_url_rule("/api/v1/toggles/<toggle_name>", view_func=controller.index)

