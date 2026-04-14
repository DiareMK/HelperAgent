# check_models.py
import os
from google import genai
from dotenv import load_dotenv

# Завантажуємо API ключ з .env файлу
load_dotenv()
try:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Помилка конфігурації. Перевірте ваш API-ключ у файлі .env: {e}")
    exit()

print("Перевіряю доступні моделі, які підтримують генерацію контенту...")
print("-" * 30)

# Отримуємо список всіх доступних моделей
found_model = False
for m in client.models.list():
    if hasattr(m, 'supported_actions') and 'generateContent' in (m.supported_actions or []):
        print(f"Знайдено підходящу модель: {m.name}")
        found_model = True
    elif hasattr(m, 'name'):
        print(f"Модель: {m.name}")
        found_model = True

if not found_model:
    print("Не знайдено жодної моделі. Перевірте налаштування вашого проєкту в Google AI Studio.")

print("-" * 30)