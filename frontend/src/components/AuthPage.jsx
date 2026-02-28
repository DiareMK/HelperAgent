// src/components/AuthPage.js
import React, { useState } from 'react';
import './AuthPage.css';
import { API_BASE_URL } from '../apiConfig'; // Імпортуємо базовий URL API

function AuthPage({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false); // НОВЕ: стан для чекбоксу
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Перевірка чекбоксу тільки при реєстрації
    if (!isLoginMode && !acceptedTerms) {
      setError('Будь ласка, ознайомтеся та погодьтеся з правилами використання системи.');
      return;
    }

    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    const url = `${API_BASE_URL}${endpoint}`; // <-- ВИКОРИСТОВУЄМО КОНСТАНТУ


    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Щось пішло не так');
      }

      if (isLoginMode) {
        onLoginSuccess(data.access_token);
      } else {
        setMessage('Реєстрація успішна! Тепер ви можете увійти.');
        setIsLoginMode(true);
        setAcceptedTerms(false); // Скидаємо чекбокс після успішної реєстрації
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLoginMode ? 'Вхід' : 'Реєстрація'}</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {!isLoginMode && (
          <div className="form-group terms-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span className="terms-text">
                Створюючи обліковий запис у системі «Спокій», я розумію та підтверджую наступне:<br /><br />
                Додаток є інструментом психологічної підтримки, а не медичним засобом. AI-помічник не ставить діагнозів і не призначає лікування. У разі критичних станів я зобов'язуюсь звертатися до кваліфікованих спеціалістів або на лінію підтримки (7333).<br /><br />
                Я надаю згоду на збір та обробку моїх персональних даних, зокрема записів настрою та текстів сесій чату, виключно для роботи алгоритмів штучного інтелекту.<br /><br />
                Я обізнаний зі своїм правом у будь-який час відкликати цю згоду та видалити свій профіль разом із повною історією комунікації.
              </span>
            </label>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button type="submit" className="submit-button">
          {isLoginMode ? 'Увійти' : 'Зареєструватися'}
        </button>
        <p className="switch-mode" onClick={() => {
          setIsLoginMode(!isLoginMode);
          setError(''); // Очищаємо помилки при перемиканні
        }}>
          {isLoginMode ? 'Немає акаунту? Зареєструватися' : 'Вже є акаунт? Увійти'}
        </p>
      </form>
    </div>
  );
}

export default AuthPage;
