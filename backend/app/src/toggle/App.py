from flask import Flask, jsonify
import requests
from src.toggle.Toggle import ToggleService
import os

app = Flask(__name__)

test_one = ToggleService("test/unit/util/ToggleTests/Example.json")

@app.route("/api")
def home():
    return jsonify()


@app.route("/api/v1/toggle")
def get_toggles():
    return test_one.get_toggles()

# get method by default
@app.route("/api/v1/toggle/<toggle_name>")
def index(toggle_name: str):
    test = {
        toggle_name: test_one.is_toggle_enabled(toggle_name)
    }
    return jsonify(test)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5555, debug=True)