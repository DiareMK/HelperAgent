// src/components/DiaryView.js
import React, { useState, useEffect } from 'react';
import './DiaryView.css';
import CheckupModal from '../CheckupModal/CheckupModal';

const Emotions = [
    { id: 'joy', label: 'Радість', icon: '😊' },
    { id: 'calm', label: 'Спокій', icon: '😌' },
    { id: 'anxiety', label: 'Тривога', icon: '😰' },
    { id: 'sadness', label: 'Сум', icon: '😢' },
    { id: 'anger', label: 'Гнів', icon: '😠' },
    { id: 'tired', label: 'Втома', icon: '😫' }
];

function DiaryView({ settings, onUpdateSettings }) {
    // Local state for editing
    const [localSettings, setLocalSettings] = useState(settings);
    const [isCheckupOpen, setIsCheckupOpen] = useState(false);
    const [showToast, setShowToast] = useState(false); // Toast state

    // Sync local state if parent settings change
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const updateField = (field, value) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Commit changes
        onUpdateSettings(localSettings);

        // Mark as done for today
        const today = new Date().toDateString();
        localStorage.setItem('lastDiaryDate', today);

        // Show Toast instead of Alert
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000); // Hide after 3s
    };

    const handleCheckupSave = (summary) => {
        updateField('checkupResult', summary);
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
                        <select
                            value={localSettings.communicationStyle}
                            onChange={e => updateField('communicationStyle', e.target.value)}
                        >
                            <option value="listener">Емпатичний слухач</option>
                            <option value="coach">Коуч (мотивація)</option>
                            <option value="friend">Друг (неформально)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Глибина відповідей</label>
                        <div className="radio-group">
                            <label className={`radio-card ${localSettings.responseDepth === 'short' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="depth"
                                    value="short"
                                    checked={localSettings.responseDepth === 'short'}
                                    onChange={() => updateField('responseDepth', 'short')}
                                />
                                Коротко і по суті
                            </label>
                            <label className={`radio-card ${localSettings.responseDepth === 'long' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="depth"
                                    value="long"
                                    checked={localSettings.responseDepth === 'long'}
                                    onChange={() => updateField('responseDepth', 'long')}
                                />
                                Детально
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Поточний фокус (Goal)</label>
                        <select
                            value={localSettings.focusGoal}
                            onChange={e => updateField('focusGoal', e.target.value)}
                        >
                            <option value="anxiety">Знизити тривогу</option>
                            <option value="solution">Пошук рішення проблеми</option>
                            <option value="vent">Просто виговоритися</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Про мене (Context)</label>
                        <textarea
                            placeholder='Наприклад: "Я студент, зараз сесія, дуже стресую..."'
                            value={localSettings.context}
                            onChange={e => updateField('context', e.target.value)}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Важливі примітки для ШІ</label>
                        <textarea
                            placeholder='Наприклад: "не давай порад, просто слухай..."'
                            value={localSettings.notes}
                            onChange={e => updateField('notes', e.target.value)}
                            rows="2"
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: MOOD TRACKER */}
                <div className="diary-column tracker-column">
                    <h3>Мій стан сьогодні</h3>

                    <div className="tracker-card">
                        <label>Оцінка настрою: <span className="score-display">{localSettings.moodScore}/10</span></label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={localSettings.moodScore}
                            onChange={e => updateField('moodScore', e.target.value)}
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
                                    className={`emotion-btn ${localSettings.selectedEmotion === emo.id ? 'active' : ''}`}
                                    onClick={() => updateField('selectedEmotion', emo.id)}
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

                        {localSettings.checkupResult && (
                            <div className="checkup-result-card">
                                <h4>Результат останнього чек-апу:</h4>
                                <p>{localSettings.checkupResult}</p>
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

            {/* TOAST NOTIFICATION */}
            {showToast && (
                <div className="toast-notification">
                    ✅ Налаштування збережено!
                </div>
            )}

            <CheckupModal
                isOpen={isCheckupOpen}
                onClose={() => setIsCheckupOpen(false)}
                onSave={handleCheckupSave}
            />
        </div>
    );
}

export default DiaryView;
