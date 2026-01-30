import os
from datetime import timedelta, datetime
import google.generativeai as genai
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager, decode_token

# 1. Ініціалізація та конфігурація
# ------------------------------------
load_dotenv()
app = Flask(__name__)

# СПОЧАТКУ ВСЯ КОНФІГУРАЦІЯ:
# -----------------------------
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "this-is-a-super-secret-key-for-testing-only"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
# -----------------------------

# ПОТІМ ІНІЦІАЛІЗАЦІЯ РОЗШИРЕНЬ:
# -----------------------------
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
# -----------------------------


# --- ДЕТАЛЬНІ ОБРОБНИКИ ПОМИЛОК JWT ---
# ---------------------------------------------
@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"message": "Request does not contain an access token.", "error": "authorization_required"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"message": "Signature verification failed.", "error": "invalid_token"}), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "Token has expired.", "error": "token_expired"}), 401
# ---------------------------------------------


# --- ДІАГНОСТИЧНИЙ "ШПИГУН" ---
# ---------------------------------------------
@app.before_request
def log_request_info():
    """Ця функція виконується перед кожним запитом."""
    auth_header = request.headers.get('Authorization')
    if auth_header:
        # print(f"--- [ШПИГУН] Отримано заголовок Authorization: {auth_header} ---")
        pass
# ---------------------------------------------


# 2. Моделі даних (Таблиці в БД)
# ------------------------------------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    # Зв'язок з сесіями (історія чатів) - один користувач має багато сесій
    sessions = db.relationship('ChatSession', backref='owner', lazy=True, cascade="all, delete-orphan")
    mood_entries = db.relationship('MoodEntry', backref='author', lazy=True, cascade="all, delete-orphan")

class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False, default="Новий чат")
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    messages = db.relationship('Message', backref='session', lazy=True, cascade="all, delete-orphan")

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    sender = db.Column(db.String(10), nullable=False) # 'user' or 'bot'
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    # Тепер повідомлення прив'язане до сесії, а не напряму до користувача (хоча через сесію ми знаємо користувача)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=False)

class MoodEntry(db.Model):
    __tablename__ = 'mood_entries'
    id = db.Column(db.Integer, primary_key=True)
    mood = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

# 3. Конфігурація Gemini AI
# ------------------------------------
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
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel(
        'models/gemini-flash-latest',
        system_instruction=SYSTEM_PROMPT
    )
except Exception as e:
    print(f"Помилка конфігурації Gemini API: {e}")
    model = None

# 4. Маршрути API
# ------------------------------------
@app.route('/api/register', methods=['POST'])
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

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email та пароль обов'язкові"}), 400
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        # --- ВИПРАВЛЕНО: Перетворюємо ID на рядок ---
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token)
    return jsonify({"error": "Неправильний email або пароль"}), 401

@app.route('/api/mood', methods=['POST'])
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

@app.route('/api/mood', methods=['GET'])
@jwt_required()
def get_mood_entries():
    current_user_id = get_jwt_identity()
    entries = MoodEntry.query.filter_by(user_id=current_user_id).order_by(MoodEntry.timestamp.desc()).all()
    mood_history = [
        {"id": entry.id, "mood": entry.mood, "notes": entry.notes, "timestamp": entry.timestamp.isoformat()}
        for entry in entries
    ]
    return jsonify(mood_history)

# --- НОВІ МАРШРУТИ ДЛЯ СЕСІЙ (ІСТОРІЯ ЧАТІВ) ---

@app.route('/api/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    current_user_id = get_jwt_identity()
    sessions = ChatSession.query.filter_by(user_id=current_user_id).order_by(ChatSession.created_at.desc()).all()
    result = [
        {"id": s.id, "title": s.title, "created_at": s.created_at.isoformat()}
        for s in sessions
    ]
    return jsonify(result)

@app.route('/api/sessions', methods=['POST'])
@jwt_required()
def create_session():
    current_user_id = get_jwt_identity()
    # Можна передати заголовок, або згенерувати дефолтний
    data = request.get_json() or {}
    title = data.get("title", f"Новий чат {datetime.now().strftime('%H:%M')}")
    
    new_session = ChatSession(user_id=current_user_id, title=title)
    db.session.add(new_session)
    db.session.commit()
    return jsonify({"id": new_session.id, "title": new_session.title}), 201

@app.route('/api/sessions/<int:session_id>/messages', methods=['GET'])
@jwt_required()
def get_session_messages(session_id):
    current_user_id = get_jwt_identity()
    # Перевірка доступу (security check: чи належить сесія цьому юзеру)
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    if not session:
        return jsonify({"error": "Сесію не знайдено або доступ заборонено"}), 404

    messages = Message.query.filter_by(session_id=session_id).order_by(Message.timestamp).all()
    history = [
        {"sender": msg.sender, "text": msg.content} 
        for msg in messages
    ]
    return jsonify(history)

# ------------------------------------------------

@app.route('/api/chat', methods=['POST'])
@jwt_required()
def handle_chat():
    if model is None:
        return jsonify({"error": "Модель Gemini не налаштована"}), 500

    current_user_id = get_jwt_identity()
    data = request.get_json()
    user_message_content = data.get("message")
    session_id = data.get("session_id") # Отримуємо ID сесії

    if not user_message_content:
        return jsonify({"error": "Повідомлення не може бути порожнім"}), 400
    
    # Якщо session_id не передали, створюємо нову сесію автоматично (або повертаємо помилку)
    # Для зручності створимо нову
    session = None
    if session_id:
        session = ChatSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    
    if not session:
        # Авто-створення сесії, якщо ID не валідний або не переданий
        # Назвемо її першими словами повідомлення
        title_snippet = " ".join(user_message_content.split()[:5])
        session = ChatSession(user_id=current_user_id, title=title_snippet or "Новий чат")
        db.session.add(session)
        db.session.commit()
        session_id = session.id
        
        # --- FIX: Додаємо вітальне повідомлення в БД, щоб воно збереглось в історії ---
        welcome_text = "Привіт, я твій друг 'Спокій'. Чим можу сьогодні допомогти?"
        # Робимо час трохи раніше (на 1 секунду), щоб воно було першим
        welcome_msg = Message(
            content=welcome_text, 
            sender='bot', 
            session_id=session_id,
            timestamp=datetime.now() - timedelta(seconds=1) 
        )
        db.session.add(welcome_msg)
        db.session.commit()
        # ---------------------------------------------------------------------------

    try:
        # Отримуємо контекст саме цієї сесії
        session_messages = Message.query.filter_by(session_id=session_id).order_by(Message.timestamp).all()
        history = []
        for msg in session_messages:
            role = 'user' if msg.sender == 'user' else 'model'
            history.append({'role': role, 'parts': [msg.content]})
        
        chat_session_gemini = model.start_chat(history=history)
        
        response = chat_session_gemini.send_message(user_message_content)
        bot_response_content = response.text

        # Зберігаємо в БД з прив'язкою до session_id
        user_message_db = Message(content=user_message_content, sender='user', session_id=session_id)
        bot_message_db = Message(content=bot_response_content, sender='bot', session_id=session_id)
        db.session.add(user_message_db)
        db.session.add(bot_message_db)
        db.session.commit()

        # Повертаємо також session_id, щоб фронтенд знав де ми
        return jsonify({"reply": bot_response_content, "session_id": session_id})

    except Exception as e:
        db.session.rollback()
        print(f"\n---!!! ПОМИЛКА в /api/chat: {e} !!!---\n")
        return jsonify({"error": "Внутрішня помилка сервера"}), 500

@app.route('/api/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    current_user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    if not session:
        return jsonify({"error": "Сесію не знайдено або доступ заборонено"}), 404
    
    db.session.delete(session)
    db.session.commit()
    return jsonify({"message": "Сесію видалено"}), 200

# 5. Запуск сервера
# ------------------------------------
if __name__ == '__main__':
    with app.app_context():
        # УВАГА: create_all не оновлює існуючі таблиці (не робить міграції).
        # Для dev середовища можна просто видалити файл instance/site.db якщо схема змінилась.
        db.create_all()
    app.run(host='0.0.0.0', port=5001, debug=True)
