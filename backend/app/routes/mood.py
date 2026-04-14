from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import MoodEntry
from .. import db

mood_bp = Blueprint('mood', __name__)

@mood_bp.route('/mood', methods=['POST'])
@jwt_required()
def add_mood_entry():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    mood = data.get('mood')
    notes = data.get('notes', '')
    if not mood:
        return jsonify({"error": "Настрій є обов'язковим полем"}), 400
    
    new_entry = MoodEntry(mood=mood, notes=notes, user_id=current_user_id)
    db.session.add(new_entry)
    db.session.commit()
    return jsonify({"message": "Запис про настрій успішно додано"}), 201

@mood_bp.route('/mood', methods=['GET'])
@jwt_required()
def get_mood_entries():
    current_user_id = get_jwt_identity()
    entries = MoodEntry.query.filter_by(user_id=current_user_id).order_by(MoodEntry.timestamp.desc()).all()
    mood_history = [
        {"id": entry.id, "mood": entry.mood, "notes": entry.notes, "timestamp": entry.timestamp.isoformat()}
        for entry in entries
    ]
    return jsonify(mood_history)
