# General library imports
from functools import wraps
import os

# Flask imports
from flask import request
# Logging
from src.util.LogFactory import LogFactory

LOGGER = LogFactory.get_logger('http')

def http_logger(api):
    @wraps(api)
    def logger_wrapper(*args, **kwargs):
        LOGGER.info(f"Method - {request.method} // Endpoint - {request.base_url} // User")
        return api(*args,**kwargs)
    return logger_wrapper