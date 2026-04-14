import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MoodDiaryPage.css';
import { API_BASE_URL } from '../../apiConfig';

const moodOptions = [
  { mood: 'terrible', emoji: '😞', label: 'Жахливо' },
  { mood: 'bad', emoji: '😐', label: 'Погано' },
  { mood: 'okay', emoji: '🙂', label: 'Нормально' },
  { mood: 'good', emoji: '😄', label: 'Добре' },
  { mood: 'great', emoji: '🤩', label: 'Чудово' },
];

function MoodDiaryPage({ token }) {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Функція для завантаження історії записів
  const fetchMoodHistory = async () => {
    setIsLoading(true);
    try {
       const response = await fetch(`${API_BASE_URL}/api/mood`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Не вдалося завантажити історію настрою');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Завантажуємо історію при першому рендері
  useEffect(() => {
    fetchMoodHistory();
  }, [token]);

  const handleSubmit = async () => {
    if (!selectedMood) {
      alert('Будь ласка, оберіть ваш настрій.');
      return;
    }
    try {
       const response = await fetch(`${API_BASE_URL}/api/mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mood: selectedMood, notes: notes })
      });

      if (!response.ok) throw new Error('Не вдалося зберегти запис');
      
      // Очищуємо форму і оновлюємо історію
      setSelectedMood(null);
      setNotes('');
      fetchMoodHistory(); 

    } catch (error) {
      console.error(error);
      alert('Помилка збереження. Спробуйте пізніше.');
    }
  };
  
  return (
    <div className="mood-diary-container">
      <header className="mood-diary-header">
        <h1>Щоденник настрою</h1>
        <button onClick={() => navigate('/chat')} className="nav-button-back">Назад до чату</button>
      </header>
      
      <div className="mood-entry-section">
        <h3>Як ви себе почуваєте сьогодні?</h3>
        <div className="mood-selector">
          {moodOptions.map(({ mood, emoji, label }) => (
            <button 
              key={mood} 
              className={`mood-option ${selectedMood === mood ? 'selected' : ''}`}
              onClick={() => setSelectedMood(mood)}
              title={label}
            >
              {emoji}
            </button>
          ))}
        </div>
        <textarea
          className="notes-input"
          placeholder="Додайте нотатку про ваш день (необов'язково)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button className="save-mood-button" onClick={handleSubmit}>Зберегти запис</button>
      </div>

      <div className="mood-history-section">
        <h3>Історія записів</h3>
        {isLoading && <p>Завантаження...</p>}
        <div className="history-list">
          {history.map(entry => (
            <div key={entry.id} className="history-item">
              <span className="history-emoji">{moodOptions.find(m => m.mood === entry.mood)?.emoji}</span>
              <div className="history-content">
                <p className="history-notes">{entry.notes || <i>Без нотаток</i>}</p>
                <p className="history-date">{new Date(entry.timestamp).toLocaleString('uk-UA')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MoodDiaryPage;
