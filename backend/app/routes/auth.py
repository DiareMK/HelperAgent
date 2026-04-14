from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from ..models import User
from .. import db, bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email та пароль обов'язкові"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Користувач з таким email вже існує"}), 409
    
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Користувача успішно створено"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email та пароль обов'язкові"}), 400
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        # Перетворюємо ID на рядок
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token)
    return jsonify({"error": "Неправильний email або пароль"}), 401
