// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage/AuthPage';
import ChatPage from './pages/ChatPage/ChatPage';
import MoodDiaryPage from './pages/MoodDiaryPage/MoodDiaryPage';
import './App.css';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/auth" 
            element={!token ? <AuthPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/chat" />} 
          />
          <Route 
            path="/chat" 
            element={token ? <ChatPage token={token} onLogout={handleLogout} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/diary" 
            element={token ? <MoodDiaryPage token={token} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={token ? "/chat" : "/auth"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;