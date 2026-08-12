"""
  Author: Zach McFadden
  Date: 7/3/26
  Synopsis: Inbound Request Logger. Logs all inbound requests and their outcomes
"""
from src.util.LogFactory import LogFactory
from flask import request

class InboundRequestLogger:

    logger = None

    def __init__(self):
        self.logger = LogFactory.get_logger("inbound_requests")

    def log_request(self, request, response, time):
        self.logger.info(f"[REQUEST DETAILS {request.remote_addr}]: [{request.method} -> {request.base_url}] [Time: {time}] [Outcome: {response.status}]")
