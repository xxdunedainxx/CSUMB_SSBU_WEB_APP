
"""
  Author: Zach McFadden
  Date: 5/12/26
  Synopsis: Auth Controller
"""
from src.Services import Services
from src.util.LogFactory import LogFactory
from src.WebServer.decorators.HTTPLogger import http_logger
from src.WebServer.WebServerInit import WebServerInit
from src.util.ErrorFactory import errorStackTrace

from flask import Flask, request, session, jsonify

flask_ref: Flask = WebServerInit.flask

class AuthController:

    def __init__(self):
        LogFactory.MAIN_LOG.info('Start TestController')

    # TODO - look into server side sessions. Flask session uses signed cookie for sessions
    # IS this good enough?
    # Ex:
    #  curl -XPOST localhost:80/login -d '{"email":"user@example.com", "password":"password"}' -H "Content-Type: application/json"
    @staticmethod
    @flask_ref.route('/login', methods=['POST'])
    @http_logger
    def login():
      try:
          data = request.json

          email = data.get("email")
          password = data.get("password")

          if Services.authService.authenticate(email, password):
              userRecord=Services.dbQueryFactory.fetch_user_by_email(email=email)
              session["user_id"] = userRecord.id
              session["email"] = email

              return jsonify({"message": "Logged in", "user_id": userRecord.id})

          return jsonify({"error": "Invalid credentials"}), 401
      except Exception as e:
          return jsonify({"error": "Invalid credentials"}), 401

    @staticmethod
    @flask_ref.route('/logout', methods=['POST'])
    @http_logger
    def logout():
        session.clear()
        return jsonify({"message": "Logged out"})

    @staticmethod
    @flask_ref.route('/me', methods=['GET'])
    @http_logger
    def me():
        return jsonify({"user_id": session["user_id"]})