from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, ChatSession, MoodEntry
from .. import db, bcrypt

account_bp = Blueprint('account', __name__)

@account_bp.route('/account', methods=['GET'])
@jwt_required()
def get_account():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Користувача не знайдено"}), 404
    
    sessions_count = ChatSession.query.filter_by(user_id=current_user_id).count()
    mood_count = MoodEntry.query.filter_by(user_id=current_user_id).count()
    
    return jsonify({
        "email": user.email,
        "sessions_count": sessions_count,
        "mood_entries_count": mood_count,
        "created_at": user.id
    }), 200

@account_bp.route('/account/password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Користувача не знайдено"}), 404
    
    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    
    if not current_password or not new_password:
        return jsonify({"error": "Вкажіть поточний і новий пароль"}), 400
    
    if len(new_password) < 4:
        return jsonify({"error": "Новий пароль має бути не менше 4 символів"}), 400
    
    if not bcrypt.check_password_hash(user.password_hash, current_password):
        return jsonify({"error": "Поточний пароль невірний"}), 403
    
    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    
    return jsonify({"message": "Пароль успішно змінено"}), 200

@account_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Користувача не знайдено"}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"message": "Обліковий запис та всі дані видалено назавжди"}), 200
