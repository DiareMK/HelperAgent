// src/components/ChatPage.js
import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css';
import DiaryView from './DiaryView';
import { API_BASE_URL } from '../apiConfig';

// Icons
const ChatIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const BookIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const UserIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const SendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

function ChatPage({ token, onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'diary' | 'tools'

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const chatEndRef = useRef(null);

  // --- THEME ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('appTheme', newTheme);
  };

  // --- SESSIONS ---
  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  };

  useEffect(() => {
    // Only refresh sessions if in chat mode or generally on mount
    fetchSessions();
  }, [token]);

  const loadSession = async (sessionId) => {
    setIsLoading(true);
    setCurrentSessionId(sessionId);
    setActiveTab('chat'); // Switch to chat when clicking a session
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const history = await response.json();
        if (history.length === 0) {
          setMessages([{ text: "Привіт! Це початок нової розмови.", sender: "bot" }]);
        } else {
          setMessages(history);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- DELETE SESSION ---
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm("Ви впевнені, що хочете видалити цей чат?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          handleNewChat();
        }
      } else {
        alert("Не вдалося видалити чат");
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([{ text: "Привіт, я твій друг 'Спокій'. Чим можу сьогодні допомогти?", sender: "bot" }]);
    setActiveTab('chat');
  };

  useEffect(() => {
    if (currentSessionId === null && messages.length === 0 && activeTab === 'chat') {
      setMessages([{ text: "Привіт, я твій друг 'Спокій'. Чим можу сьогодні допомогти?", sender: "bot" }]);
    }
  }, [currentSessionId, activeTab]);


  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, activeTab]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;
    const userMessage = { text: inputValue, sender: "user" };
    setMessages(prev => [...prev, userMessage]);

    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const payload = {
        message: currentInput,
        session_id: currentSessionId
      };

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          onLogout();
        }
        throw new Error('Помилка мережі');
      }

      const data = await response.json();

      if (data.session_id && currentSessionId !== data.session_id) {
        setCurrentSessionId(data.session_id);
        fetchSessions();
      }

      const botMessage = { text: data.reply, sender: "bot" };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Помилка:", error);
      const errorMessage = { text: "Вибачте, сталася помилка.", sender: "bot" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="dashboard-container">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar left-sidebar">
        <div className="logo-area">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.55 2.5 2.5 0 0 1 5.76.01" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.55 2.5 2.5 0 0 0-5.76.01" />
            </svg>
          </div>
          <h1>СПОКІЙ</h1>
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <ChatIcon /> <span>Чат з ШІ</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'diary' ? 'active' : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            <BookIcon /> <span>Щоденник</span>
          </button>

          <button className="nav-item">
            <UserIcon /> <span>Інструменти</span>
          </button>

          <div className="divider"></div>

          <button className="nav-item" onClick={toggleTheme}>
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
            <span>{isDarkMode ? 'Світла тема' : 'Темна тема'}</span>
          </button>
        </nav>

        <div className="user-profile">
          <div className="avatar-placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <span className="user-name">Анонімний</span>
          <button className="mini-logout" onClick={onLogout} title="Вийти">✕</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {activeTab === 'chat' ? (
          <>
            <div className="privacy-banner">
              Чат повністю анонімний. Ваші дані конфіденційні
            </div>

            <div className="chat-area">
              <div className="messages-list">
                {messages.map((msg, index) => (
                  <div key={index} className={`message-row ${msg.sender === 'bot' ? 'message-bot' : 'message-user'}`}>
                    {msg.sender === 'bot' && <div className="message-avatar bot-avatar"></div>}
                    <div className="message-bubble">
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message-row message-bot">
                    <div className="message-avatar bot-avatar"></div>
                    <div className="message-bubble typing">...</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="input-area-wrapper">
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Напишіть ваше повідомлення..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  <button className="send-btn" onClick={handleSendMessage} disabled={isLoading}>
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'diary' ? (
          <DiaryView />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h2>Розділ в розробці...</h2>
          </div>
        )}
      </main>

      {/* RIGHT SIDEBAR (HISTORY) - Only show in Chat mode */}
      {activeTab === 'chat' && (
        <aside className="sidebar right-sidebar">
          <div className="sidebar-header">
            <h2>Історія чатів</h2>
            <button className="new-chat-btn" onClick={handleNewChat} title="Новий чат">
              <PlusIcon />
            </button>
          </div>
          <div className="sessions-list">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
                onClick={() => loadSession(session.id)}
              >
                <div className="session-info">
                  <span className="session-title">{session.title}</span>
                  <span className="session-date">{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
                <button
                  className="delete-session-btn"
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  title="Видалити чат"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="no-sessions">Тут буде історія ваших розмов</p>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

export default ChatPage;
