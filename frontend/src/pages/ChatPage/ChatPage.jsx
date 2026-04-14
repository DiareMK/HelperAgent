// src/components/ChatPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatPage.css';
import DiaryView from '../../components/DiaryView/DiaryView';
import SettingsView from '../../components/SettingsView/SettingsView';
import VoiceCallModal from '../../components/VoiceCallModal/VoiceCallModal';
import { API_BASE_URL } from '../../apiConfig';

// Icons
const ChatIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const BookIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const SettingsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const SendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const HeadphonesIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>;

function ChatPage({ token, onLogout }) {
  // Navigation State - Persisted
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'chat';
  });

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  // Voice Mode State
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('listening'); // 'listening', 'processing', 'speaking'
  const [liveTranscript, setLiveTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Available Voices
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Settings State
  const [fontSize, setFontSizeState] = useState(() => {
    return parseInt(localStorage.getItem('appFontSize') || '16', 10);
  });

  const setFontSize = (size) => {
    setFontSizeState(size);
    localStorage.setItem('appFontSize', size);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
  }, [fontSize]);

  const [diarySettings, setDiarySettings] = useState(() => {
    const saved = localStorage.getItem('diarySettings');
    if (saved) {
      return JSON.parse(saved);
    } else {
      return {
        communicationStyle: 'listener',
        responseDepth: 'short',
        focusGoal: 'anxiety',
        context: '',
        notes: '',
        moodScore: 5,
        selectedEmotion: null,
        checkupResult: ''
      };
    }
  });

  useEffect(() => {
    const today = new Date().toDateString();
    const lastSaved = localStorage.getItem('lastDiaryDate');
    if (lastSaved !== today) {
      setShowReminder(true);
    }
  }, []);

  const handleUpdateSettings = (newSettingsOrUpdater) => {
    setDiarySettings(prev => {
      const newSettings = typeof newSettingsOrUpdater === 'function'
        ? newSettingsOrUpdater(prev)
        : newSettingsOrUpdater;

      localStorage.setItem('diarySettings', JSON.stringify(newSettings));
      return newSettings;
    });
    setShowReminder(false);
  };

  const handleClearHistory = async () => {
    try {
      setMessages([{ text: "Історія очищена.", sender: "bot" }]);
      setCurrentSessionId(null);

      const deletePromises = sessions.map(session =>
        fetch(`${API_BASE_URL}/api/sessions/${session.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );

      await Promise.all(deletePromises);
      setSessions([]);

      alert('Історію чатів успішно видалено.');

    } catch (error) {
      console.error("Failed to clear history", error);
      alert("Сталася помилка при видаленні історії.");
    }
  };


  const chatEndRef = useRef(null);

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
    fetchSessions();
  }, [token]);

  const loadSession = async (sessionId) => {
    setIsLoading(true);
    setCurrentSessionId(sessionId);
    setActiveTab('chat');
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const history = await response.json();
        // REMOVED logic that automatically added a welcome message to previously empty sessions on load. 
        // We just show the history as-is, or empty.
        setMessages(history);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

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
          // Clear current context if we deleted the active chat
          setCurrentSessionId(null);
          setMessages([]);
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

  // REMOVED the problematic useEffect that auto-inserted the welcome message infinitely 
  // on every click or state change if currentSessionId was null.
  // Instead, handleNewChat should be the ONLY way a fresh chat gets the welcome text explicitly.

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, activeTab]);

  /* --- VOICE LOGIC START --- */

  const speakResponse = useCallback((text) => {
    if (!text) return;
    setVoiceStatus('speaking');
    setLiveTranscript(text);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
    }

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices().length > 0
      ? window.speechSynthesis.getVoices()
      : availableVoices;

    let selectedVoice = voices.find(v =>
      v.lang === 'uk-UA' && (v.name.includes('Google') || v.name.includes('Microsoft'))
    );

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'uk-UA');
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.name.toLowerCase().includes('ukrain'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.lang = 'uk-UA';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // Only set status back to listening if the voice modal is ACTUALLY still open
      // Use functional state update to ensure we have the latest isVoiceOpen value if needed, 
      // but checking isVoiceOpen directly here from closure might be slightly stale if closed rapidly.
      setIsVoiceOpen(prevIsOpen => {
        if (prevIsOpen) {
          setVoiceStatus('listening');
          setLiveTranscript('');
          try { recognitionRef.current?.start(); } catch (e) { }
        }
        return prevIsOpen;
      });
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error", e);
      setIsVoiceOpen(prevIsOpen => {
        if (prevIsOpen) {
          setVoiceStatus('listening');
          try { recognitionRef.current?.start(); } catch (e) { }
        }
        return prevIsOpen;
      });
    };

    window.speechSynthesis.speak(utterance);
  }, [availableVoices]); // Removed isVoiceOpen dependency to prevent stale closures re-triggering unnecessary renders

  // Handle Message Sending
  const handleSendMessage = async (textOverride = null) => {
    const textToSend = textOverride !== null ? textOverride : inputValue;

    // Prevent sending empty messages
    if (!textToSend || textToSend.trim() === '') return;

    if (textOverride === null) setInputValue('');

    const userMessage = { text: textToSend, sender: "user" };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    let styleInstruction = "";
    const style = diarySettings.communicationStyle;
    const isCoach = style === 'coach' || style === 'Коуч';

    if (style === 'listener' || style === 'Слухач' || style === 'Емпат') {
      styleInstruction = `
        РОЛЬ: Ти — мудрий друг. 
        ІНСТРУКЦІЯ: Слухай глибше, ніж написано. Відловлюй підтекст. Твоя сила — у вчасному мовчанні та глибоких, не банальних запитаннях.
        ТОН: Теплий, спокійний, довірливий.`;
    } else if (isCoach) {
      styleInstruction = `
        РОЛЬ: Ти — професійний ментор високого рівня. Твоя мета — результат.
        МЕТОД: Сократичний діалог. Задавай глибокі, влучні питання, які змушують користувача знайти відповідь самостійно.

        ПРИНЦИП "ХАМЕЛЕОН" (АДАПТАЦІЯ ЛЕКСИКИ):
        Проаналізуй контекст користувача і підлаштуй словник:
        - IT/Code: "дебаг", "фіча", "спринт", "MVP".
        - Спорт/Військова справа: "тактика", "дистанція", "дисципліна", "перегрупування", "бойова готовність".
        - Творчість/Мистецтво: "натхнення", "потік", "чернетку", "бачення".
        - Незрозуміло/Абстрактно: "стратегія", "крок", "фокус", "фундамент".

        ТОН: Прагматичний, без жалю, вірить у силу користувача. Питання: "Який наступний крок?", "Що змінимо зараз?".`;
    } else if (style === 'friend' || style === 'Друг') {
      styleInstruction = `
        РОЛЬ: Твій давній кореш.
        ІНСТРУКЦІЯ: Спілкуйся максимально просто, на 'ти', з гумором. Уникай офіціозу.
        ТОН: Живий, легкий, можливо трохи іронічний.`;
    } else {
      styleInstruction = "РОЛЬ: Компетентний та уважний асистент.";
    }

    const moodScore = diarySettings.moodScore || 5;
    let energyInstruction = "";
    if (moodScore <= 4) {
      energyInstruction = "Користувач має низький ресурс. Будь м'якшим, не дави, пропонуй малі кроки.";
    } else if (moodScore >= 8) {
      energyInstruction = "Користувач на підйомі! Будь енергійним, підтримуй драйв, челленджи його.";
    } else {
      energyInstruction = "Користувач у стабільному стані. Тримай рівний, робочий ритм.";
    }

    const userContext = diarySettings.context;
    let contextPart = "";
    if (userContext && userContext.trim().length > 0) {
      contextPart = `КОНТЕКСТ КОРИСТУВАЧА: "${userContext}". Використовуй це як фундамент.`;
    } else {
      contextPart = "Контекст не задано. Акуратно з'ясуй, що турбує користувача.";
    }

    const contextPrompt = `
Ти — асистент 'Спокій'. 
ГАРМОНІЗАЦІЯ РОЛЕЙ: Твоя особистість 'Спокій' є гнучкою. Бути жорстким Tech Lead-ом у режимі 'Коуч' — це і є найкращий прояв турботи 'Спокою' в цей момент. Тобі не потрібно "виходити з образу" чи пояснювати це, розмовляй природно.

СУВОРА ЗАБОРОНА МЕТА-КОМЕНТАРІВ:
НІКОЛИ не виводь текст своїх внутрішніх роздумів, пояснень зміни тону або конфліктів інструкцій (наприклад, "(М'який тон...)"). 
Виводь ТІЛЬКИ фінальну відповідь користувачеві.

ТВІЙ ПОТОЧНИЙ РЕЖИМ: ${style}
${styleInstruction}

${contextPart}
Настрій: ${moodScore}/10. 
${energyInstruction}
Нотатки: ${diarySettings.notes}.

ПРАВИЛО "ХАМЕЛЕОН":
- Якщо користувач пише про КОД/IT -> Використовуй метафори розробки.
- Якщо користувач пише про ЕМОЦІЇ -> Будь теплим.

ПОВІДОМЛЕННЯ КОРИСТУВАЧА:
"${textToSend}"
    `.trim();

    try {
      const payload = {
        message: textToSend,
        session_id: currentSessionId,
        context_prompt: contextPrompt
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
          return;
        }
        // Зчитуємо тіло помилки з бекенду
        let errData = {};
        try { errData = await response.json(); } catch (_) { }

        if (response.status === 429 || errData.error_type === 'quota_exceeded') {
          const errorMessage = { text: "⏳ Сервіс зараз перевантажений. Спробуй ще раз через 1–2 хвилини.", sender: "bot" };
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }

        throw new Error(errData.error || 'Помилка сервера');
      }

      const data = await response.json();

      if (data.session_id && currentSessionId !== data.session_id) {
        setCurrentSessionId(data.session_id);
        fetchSessions();
      }

      const botMessage = { text: data.reply, sender: "bot" };
      setMessages(prev => [...prev, botMessage]);

      // Using functional state to safely check if voice modal is STILL open before speaking
      setIsVoiceOpen(prevIsOpen => {
        if (prevIsOpen) {
          speakResponse(data.reply);
        }
        return prevIsOpen;
      });

    } catch (error) {
      console.error("Помилка:", error);
      const errorMessage = { text: `⚠️ ${error.message || 'Вибачте, сталася помилка. Спробуйте пізніше.'}`, sender: "bot" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Recognition
  useEffect(() => {
    if (!isVoiceOpen) {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) { }
      }
      setLiveTranscript('');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("На жаль, ваш браузер не підтримує розпізнавання голосу.");
      setIsVoiceOpen(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'uk-UA';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setVoiceStatus('listening');
      setLiveTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        setLiveTranscript(interimTranscript);
      }

      if (finalTranscript) {
        setLiveTranscript(finalTranscript);
        setVoiceStatus('processing');
        try { recognition.stop(); } catch (e) { }
        handleSendMessage(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Error", event.error);
      // Don't auto-close modal on silent errors like "no-speech", just restart listening
      if (event.error === 'no-speech' && isVoiceOpen) {
        try { recognition.start(); } catch (e) { }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) { console.error(e); }

    return () => {
      try { recognition.stop(); } catch (e) { }
    };
  }, [isVoiceOpen]);

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

          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon /> <span>Налаштування</span>
          </button>

          <div className="divider"></div>

          <button className="nav-item" onClick={toggleTheme}>
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
            <span>{isDarkMode ? 'Світла тема' : 'Темна тема'}</span>
          </button>
        </nav>

        <div className="user-profile" onClick={() => setActiveTab('settings')} style={{ cursor: 'pointer' }}>
          <div className="avatar-placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <span className="user-name">Анонімний</span>
          <button className="mini-logout" onClick={(e) => { e.stopPropagation(); onLogout(); }} title="Вийти">✕</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {showReminder && activeTab !== 'diary' && (
          <div className="reminder-banner">
            <span>📅 Не забудьте заповнити щоденник сьогодні! Це допоможе краще вас розуміти.</span>
            <button onClick={() => setActiveTab('diary')}>Заповнити</button>
          </div>
        )}

        {/* VOICE MODAL OVERLAY */}
        <VoiceCallModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          status={voiceStatus}
          transcript={liveTranscript}
        />

        {activeTab === 'chat' ? (
          <>
            {/* Banner inside chat */}
            <div className="privacy-banner">
              Чат повністю анонімний. Ваші дані конфіденційні
            </div>

            <div className="chat-area">
              <div className="messages-list">
                {messages.map((msg, index) => (
                  <div key={index} className={`message-row ${msg.sender === 'bot' ? 'message-bot' : 'message-user'}`}>
                    {msg.sender === 'bot' && <div className="message-avatar bot-avatar"></div>}
                    <div className="message-bubble">
                      {msg.sender === 'bot' ? (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}

                {/* 
                  FIX: The typing indicator logic inside map was causing issues. 
                  It's now correctly placed AFTER the messages list map, only showing when isLoading is true.
                */}
                {isLoading && (
                  <div className="message-row message-bot">
                    <div className="message-avatar bot-avatar"></div>
                    <div className="message-bubble">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
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
                    spellCheck={false}
                    autoCorrect="off"
                    autoComplete="off"
                    autoCapitalize="off"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    lang="uk"
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  <button
                    className="voice-call-trigger-input"
                    onClick={() => setIsVoiceOpen(true)}
                    title="Голосовий режим"
                    type="button"
                  >
                    <HeadphonesIcon />
                  </button>
                  <button className="send-btn" onClick={() => handleSendMessage(null)} disabled={isLoading || !inputValue.trim()}>
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'diary' ? (
          <DiaryView settings={diarySettings} onUpdateSettings={handleUpdateSettings} />
        ) : activeTab === 'settings' ? (
          <SettingsView
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            fontSize={fontSize}
            onChangeFontSize={setFontSize}
            onClearHistory={handleClearHistory}
            onLogout={onLogout}
          />
        ) : null}
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
          </div>
        </aside>
      )}

      {/* MOBILE BOTTOM TAB BAR — hidden on desktop via CSS */}
      <nav className="mobile-tab-bar">
        <button
          className={`mobile-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <ChatIcon />
          <span>Чат</span>
        </button>
        <button
          className={`mobile-tab ${activeTab === 'diary' ? 'active' : ''}`}
          onClick={() => setActiveTab('diary')}
        >
          <BookIcon />
          <span>Щоденник</span>
        </button>
        <button
          className={`mobile-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon />
          <span>Налаштування</span>
        </button>
      </nav>
    </div>
  );
}

export default ChatPage;
