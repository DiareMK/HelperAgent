// src/components/AuthPage.js
import React, { useState } from 'react';
import './AuthPage.css';
import { API_BASE_URL } from '../apiConfig'; // Імпортуємо базовий URL API

function AuthPage({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

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
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button type="submit" className="submit-button">
          {isLoginMode ? 'Увійти' : 'Зареєструватися'}
        </button>
        <p className="switch-mode" onClick={() => setIsLoginMode(!isLoginMode)}>
          {isLoginMode ? 'Немає акаунту? Зареєструватися' : 'Вже є акаунт? Увійти'}
        </p>
      </form>
    </div>
  );
}

export default AuthPage;
