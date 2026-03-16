from flask import Flask, request
from src.WebServer.WebServerInit import WebServerInit
from src.util.LogFactory import LogFactory

flask_ref: Flask = WebServerInit.flask

# Track request start time
@flask_ref.before_request
def before_request_processor():
    # TODO
    # Get the URL path
    url_path = request.path
    print(f"Request URL Path: {url_path}")

    # Get the endpoint name (e.g., 'index', 'profile')
    endpoint = request.endpoint
    print(f"Target Endpoint Name: {endpoint}")

    # Get the actual target function (if endpoint is not None)
    if endpoint:
        get_endpoint_function(endpoint)


# Log details after request completes
@flask_ref.after_request
def after_request_processor(response):
    # TODO
    log_request(response)
    return response

def log_request(response):
    # TODO
    pass

def get_endpoint_function(endpoint: str):
    target_function = flask_ref.view_functions.get(endpoint)
    if target_function:
        print(f"Target Function Name: {target_function.__name__}")
        return target_function.__name__
    else:
        return "empty"