import os
from datetime import timedelta
from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask import jsonify

# Завантажуємо змінні оточення
load_dotenv()

# Ініціалізація розширень
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Конфігурація
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = "this-is-a-super-secret-key-for-testing-only"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]

    # Ініціалізація розширень для поточного app
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Обробники помилок JWT
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"message": "Request does not contain an access token.", "error": "authorization_required"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"message": "Signature verification failed.", "error": "invalid_token"}), 422

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"message": "Token has expired.", "error": "token_expired"}), 401

    # Реєстрація Blueprint-ів
    from .routes.auth import auth_bp
    from .routes.chat import chat_bp
    from .routes.mood import mood_bp
    from .routes.account import account_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(chat_bp, url_prefix='/api')
    app.register_blueprint(mood_bp, url_prefix='/api')
    app.register_blueprint(account_bp, url_prefix='/api')

    return app
