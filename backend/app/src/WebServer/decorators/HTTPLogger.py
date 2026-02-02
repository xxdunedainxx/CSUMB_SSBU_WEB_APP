"""
  Author: Zach McFadden
  Date: 2/1/26
  Synopsis: Decorator for logging HTTP inbound requests.
            NOTE: These logs DO not go into 'main.log'. Rather they go into the 'http.log' file.
"""
from functools import wraps
from flask import request
from src.util.LogFactory import LogFactory

LOGGER = LogFactory.get_logger('http')

def http_logger(api):
    @wraps(api)
    def logger_wrapper(*args, **kwargs):
        LOGGER.info(f"Method - {request.method} // Endpoint - {request.base_url} // User")
        return api(*args,**kwargs)
    return logger_wrapper