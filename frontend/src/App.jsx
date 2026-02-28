// src/App.js
import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import ChatPage from './components/ChatPage';
import MoodDiaryPage from './components/MoodDiaryPage';
import './App.css'; // Загальні стилі для всього додатку

function App() {
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('chat'); // НОВЕ: для навігації

  // При першому завантаженні, перевіряємо чи є токен в localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
     setCurrentPage('chat'); // Після входу завжди відкриваємо чат
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  // НОВЕ: функція для рендерингу поточної сторінки
  const renderPage = () => {
    if (currentPage === 'diary') {
      return <MoodDiaryPage token={token} navigateToChat={() => setCurrentPage('chat')} />;
    }
    // За замовчуванням показуємо чат
    return <ChatPage token={token} onLogout={handleLogout} navigateToDiary={() => setCurrentPage('diary')} />;
  };

  return (
    <div className="app-container">
      {!token ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        renderPage() // Викликаємо функцію рендерингу
      )}
    </div>
  );
}

export default App;