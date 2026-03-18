from src.util.LogFactory import LogFactory
from src.WebServer.decorators.HTTPLogger import http_logger
from src.WebServer.WebServerInit import WebServerInit
from src.toggle.Toggle import ToggleService
from flask import Flask, jsonify

flask_ref: Flask = WebServerInit.flask

class ToggleController:

    def __init__(self):
        LogFactory.MAIN_LOG.info('Starting ToggleController')
        self.toggle_file = ToggleService("src/WebServer/controllers/toggle/Toggles.json")

        @staticmethod
        @flask_ref.route("/api/v1/toggles")
        @http_logger
        def get_toggles():
           return self.toggle_file.get_toggles()

        @flask_ref.route("/api/v1/toggles/<toggle_name>")
        @http_logger
        def index(toggle_name: str):
            test = {
                toggle_name: self.toggle_file.is_toggle_enabled(toggle_name)
            }
            return jsonify(test)

