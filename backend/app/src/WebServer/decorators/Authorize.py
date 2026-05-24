"""
  Author: Zach McFadden
  Date: 5/12/26
  Synopsis: Decorator for authorizing endpoints
"""
from functools import wraps
from flask import request, session, jsonify
from src.util.LogFactory import LogFactory

LOGGER = LogFactory.get_logger('http')


"""
    Simple decorator for endpoints to auth a request 
"""
def authorize(api):
    @wraps(api)
    def authorize(*args, **kwargs):
        LOGGER.info(f"Auth check.")
        if "user_id" not in session:
            LOGGER.info(f"Not auth'd!")
            return jsonify({"error": "Unauthorized"}), 401
        else:
            LOGGER.info(f"Authing user {session['user_id']}")
            return api(*args,**kwargs)
    return authorize

