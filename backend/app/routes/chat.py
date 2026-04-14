import os
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from google import genai
from google.genai import types
from ..models import ChatSession, Message
from .. import db

chat_bp = Blueprint('chat', __name__)

SYSTEM_PROMPT = """
Ти — емпатичний та підтримуючий чат-бот на ім'я "Спокій".
Твоя мета — надавати первинну психологічну підтримку в спокійній та турботливій манері.
Твої відповіді мають бути короткими, але змістовними.
ЗАБОРОНЕНО:
- Ставити медичні діагнози.
- Призначати лікування або давати поради щодо медикаментів.
- Засуджувати чи критикувати користувача. 
ОБОВ'ЯЗКОВО: - Якщо користувач згадує про наміри нашкодити собі (суїцид, самопошкодження), негайно та м'яко перерви розмову та надай наступне повідомлення: "Мені дуже шкода, що ти проходиш через це. Я лише програма і не можу допомогти в такій серйозній ситуації. Будь ласка, звернися за професійною допомогою. Ось номер гарячої лінії підтримки в Україні: 7333." - Завжди проявляй співчуття та розуміння.
- Використовуй техніки активного слухання (перефразуй, став уточнюючі питання).
"""
GEMINI_MODEL = 'gemini-2.5-flash'

try:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        gemini_client = genai.Client(api_key=api_key)
        print(f"Gemini API ініціалізовано (модель: {GEMINI_MODEL})")
    else:
        gemini_client = None
        print("Помилка конфігурації Gemini API: GEMINI_API_KEY не знайдено.")
except Exception as e:
    print(f"Помилка конфігурації Gemini API: {e}")
    gemini_client = None


@chat_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    current_user_id = get_jwt_identity()
    sessions = ChatSession.query.filter_by(user_id=current_user_id).order_by(ChatSession.created_at.desc()).all()
    result = [
        {"id": s.id, "title": s.title, "created_at": s.created_at.isoformat()}
        for s in sessions
    ]
    return jsonify(result)

@chat_bp.route('/sessions', methods=['POST'])
@jwt_required()
def create_session():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    title = data.get("title", f"Новий чат {datetime.now().strftime('%H:%M')}")
    
    new_session = ChatSession(user_id=current_user_id, title=title)
    db.session.add(new_session)
    db.session.commit()
    return jsonify({"id": new_session.id, "title": new_session.title}), 201

@chat_bp.route('/sessions/<int:session_id>/messages', methods=['GET'])
@jwt_required()
def get_session_messages(session_id):
    current_user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    if not session:
        return jsonify({"error": "Сесію не знайдено або доступ заборонено"}), 404

    messages = Message.query.filter_by(session_id=session_id).order_by(Message.timestamp).all()
    history = [
        {"sender": msg.sender, "text": msg.content} 
        for msg in messages
    ]
    return jsonify(history)

@chat_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    current_user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    if not session:
        return jsonify({"error": "Сесію не знайдено або доступ заборонено"}), 404
    
    db.session.delete(session)
    db.session.commit()
    return jsonify({"message": "Сесію видалено"}), 200

@chat_bp.route('/chat', methods=['POST'])
@jwt_required()
def handle_chat():
    if gemini_client is None:
        return jsonify({"error": "Модель Gemini не налаштована"}), 500

    current_user_id = get_jwt_identity()
    data = request.get_json()
    user_message_content = data.get("message")
    session_id = data.get("session_id")
    context_prompt = data.get("context_prompt")

    if not user_message_content:
        return jsonify({"error": "Повідомлення не може бути порожнім"}), 400
    
    session = None
    if session_id:
        session = ChatSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    
    if not session:
        # Авто-створення сесії
        title_snippet = " ".join(user_message_content.split()[:5])
        session = ChatSession(user_id=current_user_id, title=title_snippet or "Новий чат")
        db.session.add(session)
        db.session.commit()
        session_id = session.id
        
        welcome_text = "Привіт, я твій друг 'Спокій'. Чим можу сьогодні допомогти?"
        welcome_msg = Message(
            content=welcome_text, 
            sender='bot', 
            session_id=session_id,
            timestamp=datetime.now() - timedelta(seconds=1) 
        )
        db.session.add(welcome_msg)
        db.session.commit()

    try:
        session_messages = Message.query.filter_by(session_id=session_id).order_by(Message.timestamp).all()
        history = []
        for msg in session_messages:
            role = 'user' if msg.sender == 'user' else 'model'
            history.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))
        
        full_message_to_send = user_message_content
        if context_prompt:
             full_message_to_send = f"{context_prompt}\n\n---\nПовідомлення користувача:\n{user_message_content}"

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
        )
        history.append(types.Content(role='user', parts=[types.Part(text=full_message_to_send)]))
        
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=history,
            config=config,
        )
        bot_response_content = response.text

        user_message_db = Message(content=user_message_content, sender='user', session_id=session_id)
        bot_message_db = Message(content=bot_response_content, sender='bot', session_id=session_id)
        db.session.add(user_message_db)
        db.session.add(bot_message_db)
        db.session.commit()

        return jsonify({"reply": bot_response_content, "session_id": session_id})

    except Exception as e:
        db.session.rollback()
        error_str = str(e)
        print(f"\n---!!! ПОМИЛКА в /api/chat: {e} !!!---\n")
        
        if '429' in error_str or 'quota' in error_str.lower() or 'RESOURCE_EXHAUSTED' in error_str:
            return jsonify({
                "error": "На жаль, цей сервіс наразі перевантажений. Спробуй, будь ласка, через хвилину.",
                "error_type": "quota_exceeded"
            }), 429
        
        return jsonify({"error": "Внутрішня помилка сервера"}), 500
