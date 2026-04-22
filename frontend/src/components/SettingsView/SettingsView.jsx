// src/components/SettingsView.jsx
import React, { useState, useEffect } from 'react';
import './SettingsView.css';

import { API_BASE_URL } from '../../apiConfig';

function SettingsView({ isDarkMode, toggleTheme, fontSize, onChangeFontSize, onClearHistory, onLogout }) {

    const [accountInfo, setAccountInfo] = useState(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/account`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAccountInfo(data);
                }
            } catch (e) {
                console.error("Failed to fetch account", e);
            }
        };
        fetchAccount();
    }, [token]);

    const handleExportData = () => {
        alert("Функція експорту даних буде доступна незабаром!");
    };

    const handleClearData = () => {
        if (window.confirm("Ви дійсно хочете видалити всю історію чату? Цю дію неможливо відмінити.")) {
            onClearHistory();
        }
    };

    const handleChangePassword = async () => {
        setPasswordMsg({ type: '', text: '' });

        if (!currentPassword || !newPassword) {
            setPasswordMsg({ type: 'error', text: 'Заповніть обидва поля' });
            return;
        }
        if (newPassword.length < 4) {
            setPasswordMsg({ type: 'error', text: 'Новий пароль має бути мінімум 4 символи' });
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/account/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setPasswordMsg({ type: 'success', text: 'Пароль успішно змінено! ✅' });
                setCurrentPassword('');
                setNewPassword('');
                setShowPasswordForm(false);
            } else {
                setPasswordMsg({ type: 'error', text: data.error || 'Помилка зміни паролю' });
            }
        } catch (e) {
            setPasswordMsg({ type: 'error', text: 'Помилка з\'єднання з сервером' });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Ваш обліковий запис було видалено. До побачення! 👋");
                if (onLogout) onLogout();
            } else {
                const data = await res.json();
                alert(data.error || "Помилка видалення акаунту");
            }
        } catch (e) {
            alert("Помилка з'єднання з сервером");
        }
    };

    return (
        <div className="settings-container">
            <h2 className="settings-title">Налаштування</h2>

            <div className="settings-grid">
                {/* ACCOUNT CARD */}
                <div className="settings-card account-card">
                    <div className="card-header">
                        <span className="card-icon">👤</span>
                        <h3>Обліковий запис</h3>
                    </div>

                    {accountInfo ? (
                        <div className="account-info">
                            <div className="account-field">
                                <span className="account-label">📧 Email</span>
                                <span className="account-value">{accountInfo.email}</span>
                            </div>
                            <div className="account-field">
                                <span className="account-label">💬 Чатів</span>
                                <span className="account-value">{accountInfo.sessions_count}</span>
                            </div>
                            <div className="account-field">
                                <span className="account-label">📊 Записів щоденника</span>
                                <span className="account-value">{accountInfo.mood_entries_count}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="card-desc">Завантаження...</p>
                    )}

                    {/* Change Password */}
                    {!showPasswordForm ? (
                        <button
                            className="action-btn password-btn"
                            onClick={() => setShowPasswordForm(true)}
                        >
                            🔑 Змінити пароль
                        </button>
                    ) : (
                        <div className="password-form">
                            <input
                                type="password"
                                placeholder="Поточний пароль"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="password-input"
                            />
                            <input
                                type="password"
                                placeholder="Новий пароль"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="password-input"
                            />
                            <div className="password-actions">
                                <button className="action-btn save-pass-btn" onClick={handleChangePassword}>
                                    Зберегти
                                </button>
                                <button className="action-btn cancel-pass-btn" onClick={() => {
                                    setShowPasswordForm(false);
                                    setPasswordMsg({ type: '', text: '' });
                                }}>
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    )}

                    {passwordMsg.text && (
                        <p className={`password-msg ${passwordMsg.type}`}>{passwordMsg.text}</p>
                    )}

                    {/* Delete Account */}
                    {!showDeleteConfirm ? (
                        <button
                            className="action-btn delete-account-btn"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            ⚠️ Видалити обліковий запис
                        </button>
                    ) : (
                        <div className="delete-confirm-box">
                            <p className="delete-warning">
                                ⚠️ <strong>Увага!</strong> Видалення акаунту призведе до <strong>безповоротної втрати</strong> всіх ваших даних: чатів, щоденника та налаштувань.
                            </p>
                            <div className="delete-actions">
                                <button className="action-btn confirm-delete-btn" onClick={handleDeleteAccount}>
                                    Так, видалити назавжди
                                </button>
                                <button className="action-btn cancel-delete-btn" onClick={() => setShowDeleteConfirm(false)}>
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* APPEARANCE CARD */}
                <div className="settings-card appearance-card">
                    <div className="card-header">
                        <span className="card-icon">🎨</span>
                        <h3>Зовнішній вигляд</h3>
                    </div>
                    <p className="card-desc">Налаштуйте інтерфейс під себе.</p>

                    <div className="setting-item">
                        <span>Тема застосунку</span>
                        <button className="theme-toggle-btn" onClick={toggleTheme}>
                            {isDarkMode ? '🌙 Темна' : '☀️ Світла'}
                        </button>
                    </div>

                    <div className="setting-item font-size-item">
                        <div className="font-label">
                            <span>Розмір шрифту</span>
                            <span className="size-preview">{fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="12"
                            max="24"
                            step="1"
                            value={fontSize}
                            onChange={(e) => onChangeFontSize(Number(e.target.value))}
                            className="font-slider"
                        />
                    </div>
                </div>

                {/* DATA & PRIVACY CARD */}
                <div className="settings-card data-card">
                    <div className="card-header">
                        <span className="card-icon">🔒</span>
                        <h3>Керування даними</h3>
                    </div>
                    <p className="card-desc">Ваші дані належать тільки вам.</p>

                    <button className="action-btn export-btn" onClick={handleExportData}>
                        📥 Експорт мого щоденника
                    </button>

                    <button className="action-btn delete-btn" onClick={handleClearData}>
                        🗑️ Очистити історію чату
                    </button>
                </div>

                {/* EMERGENCY CARD */}
                <div className="settings-card emergency-card">
                    <div className="card-header">
                        <span className="card-icon">🆘</span>
                        <h3>Екстрена допомога</h3>
                    </div>
                    <p className="card-desc warning-text">
                        Якщо ви відчуваєте, що не можете впоратися, або є загроза життю — зверніться по допомогу.
                    </p>

                    <ul className="hotline-list">
                        <li>
                            <strong>Національна гаряча лінія:</strong>
                            <a href="tel:0800500335">0 800 500 335</a>
                        </li>
                        <li>
                            <strong>Гаряча лінія запобігання суїцидам:</strong>
                            <a href="tel:7333">7333</a>
                        </li>
                        <li>
                            <strong>Швидка допомога:</strong>
                            <a href="tel:103">103</a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* LOGOUT BUTTON */}
            <button className="action-btn logout-btn" onClick={onLogout}>
                🚪 Вийти з облікового запису
            </button>

            {/* DISCLAIMER FOOTER */}
            <div className="settings-footer-disclaimer">
                ШІ-асистент не є лікарем. У критичних ситуаціях звертайтеся до фахівців.
            </div>
        </div>
    );
}

export default SettingsView;
