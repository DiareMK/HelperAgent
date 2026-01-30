// src/components/DiaryView.js
import React, { useState } from 'react';
import './DiaryView.css';
import CheckupModal from './CheckupModal';

const Emotions = [
    { id: 'joy', label: 'Радість', icon: '😊' },
    { id: 'calm', label: 'Спокій', icon: '😌' },
    { id: 'anxiety', label: 'Тривога', icon: '😰' },
    { id: 'sadness', label: 'Сум', icon: '😢' },
    { id: 'anger', label: 'Гнів', icon: '😠' },
    { id: 'tired', label: 'Втома', icon: '😫' }
];

function DiaryView() {
    // Left Column State
    const [communicationStyle, setCommunicationStyle] = useState('listener');
    const [responseDepth, setResponseDepth] = useState('short');
    const [focusGoal, setFocusGoal] = useState('anxiety');
    const [context, setContext] = useState('');
    const [notes, setNotes] = useState('');

    // Right Column State
    const [moodScore, setMoodScore] = useState(5);
    const [selectedEmotion, setSelectedEmotion] = useState(null);

    // Check-up State
    const [isCheckupOpen, setIsCheckupOpen] = useState(false);
    const [checkupResult, setCheckupResult] = useState('');

    const handleSave = () => {
        // Here we would typically send data to backend
        console.log({
            settings: { communicationStyle, responseDepth, focusGoal, context, notes },
            tracker: { moodScore, selectedEmotion, checkupResult }
        });
        alert('Налаштування та дані чек-апу збережено! (імітація)');
    };

    const handleCheckupSave = (summary) => {
        setCheckupResult(summary);
    };

    return (
        <div className="diary-container">
            <h2 className="diary-title">Налаштування та Щоденник</h2>

            <div className="diary-grid">
                {/* LEFT COLUMN: SETTINGS */}
                <div className="diary-column settings-column">
                    <h3>Налаштування співрозмовника</h3>

                    <div className="form-group">
                        <label>Стиль спілкування</label>
                        <select value={communicationStyle} onChange={e => setCommunicationStyle(e.target.value)}>
                            <option value="listener">Емпатичний слухач</option>
                            <option value="coach">Коуч (мотивація)</option>
                            <option value="friend">Друг (неформально)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Глибина відповідей</label>
                        <div className="radio-group">
                            <label className={`radio-card ${responseDepth === 'short' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="depth"
                                    value="short"
                                    checked={responseDepth === 'short'}
                                    onChange={() => setResponseDepth('short')}
                                />
                                Коротко і по суті
                            </label>
                            <label className={`radio-card ${responseDepth === 'long' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="depth"
                                    value="long"
                                    checked={responseDepth === 'long'}
                                    onChange={() => setResponseDepth('long')}
                                />
                                Детально
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Поточний фокус (Goal)</label>
                        <select value={focusGoal} onChange={e => setFocusGoal(e.target.value)}>
                            <option value="anxiety">Знизити тривогу</option>
                            <option value="solution">Пошук рішення проблеми</option>
                            <option value="vent">Просто виговоритися</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Про мене (Context)</label>
                        <textarea
                            placeholder='Наприклад: "Я студент, зараз сесія, дуже стресую..."'
                            value={context}
                            onChange={e => setContext(e.target.value)}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Важливі примітки для ШІ</label>
                        <textarea
                            placeholder='Наприклад: "не давай порад, просто слухай..."'
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows="2"
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: MOOD TRACKER */}
                <div className="diary-column tracker-column">
                    <h3>Мій стан сьогодні</h3>

                    <div className="tracker-card">
                        <label>Оцінка настрою: <span className="score-display">{moodScore}/10</span></label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={moodScore}
                            onChange={e => setMoodScore(e.target.value)}
                            className="mood-slider"
                        />
                        <div className="slider-labels">
                            <span>1 (Погано)</span>
                            <span>10 (Чудово)</span>
                        </div>
                    </div>

                    <div className="tracker-card">
                        <label>Яка емоція переважає?</label>
                        <div className="emotions-grid">
                            {Emotions.map(emo => (
                                <button
                                    key={emo.id}
                                    className={`emotion-btn ${selectedEmotion === emo.id ? 'active' : ''}`}
                                    onClick={() => setSelectedEmotion(emo.id)}
                                >
                                    <span className="emo-icon">{emo.icon}</span>
                                    <span className="emo-label">{emo.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CHECK-UP SECTION */}
                    <div className="checkup-section">
                        <button className="checkup-btn" onClick={() => setIsCheckupOpen(true)}>
                            🩺 Пройти швидкий чек-ап
                        </button>

                        {checkupResult && (
                            <div className="checkup-result-card">
                                <h4>Результат останнього чек-апу:</h4>
                                <p>{checkupResult}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="diary-footer">
                <button className="save-settings-btn" onClick={handleSave}>
                    Зберегти налаштування
                </button>
            </div>

            <CheckupModal
                isOpen={isCheckupOpen}
                onClose={() => setIsCheckupOpen(false)}
                onSave={handleCheckupSave}
            />
        </div>
    );
}

export default DiaryView;
