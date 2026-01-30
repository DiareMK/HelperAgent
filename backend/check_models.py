# check_models.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Завантажуємо API ключ з .env файлу
load_dotenv()
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Помилка конфігурації. Перевірте ваш API-ключ у файлі .env: {e}")
    exit()

print("Перевіряю доступні моделі, які підтримують генерацію контенту...")
print("-" * 30)

# Отримуємо список всіх доступних моделей
# і виводимо лише ті, які підходять для нашого чату
found_model = False
for m in genai.list_models():
  if 'generateContent' in m.supported_generation_methods:
    print(f"Знайдено підходящу модель: {m.name}")
    found_model = True

if not found_model:
    print("Не знайдено жодної підходящої моделі. Перевірте налаштування вашого проєкту в Google AI Studio.")

print("-" * 30)