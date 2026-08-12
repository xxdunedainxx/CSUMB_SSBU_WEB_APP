"""
  Author: Zach McFadden
  Date: 7/3/26
  Synopsis: Central Request Processor. Here we can add hooks for before and after requests are processed
"""
from src.util.LogFactory import LogFactory
from src.WebServer.decorators.requestprocessing.InboundRequestLogger import InboundRequestLogger
from src.sec.RateLimiting import RateLimiter
from src.Configuration import CONF_INSTANCE
from flask import g, request
import time

class RequestProcessor:

    def __init__(self, flask_ref):
        LogFactory.MAIN_LOG.info("Register req processor")
        self.flask_ref = flask_ref
        self.register()
        self.inboundLogger = InboundRequestLogger()
        self.rateLimiter = RateLimiter(CONF_INSTANCE.GLOBAL_RATE_LIMIT_PER_MIN)

    def register(self):
        self.flask_ref.before_request(self.before_request)
        self.flask_ref.after_request(self.after_request)

    def before_request(self):
        LogFactory.MAIN_LOG.info("Running pre-request prep")
        g.start_time = time.perf_counter()

        if self.rateLimiter.rate_limit_by_ip(request.remote_addr):
            return {"error": "rate limited"}, 429

    def after_request(self, response):
        duration = time.perf_counter() - g.start_time
        self.inboundLogger.log_request(
            response=response,
            request=request,
            time=duration
        )
        return response
