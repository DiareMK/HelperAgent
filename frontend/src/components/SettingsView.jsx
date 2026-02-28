// src/components/SettingsView.js
import React from 'react';
import './SettingsView.css';

function SettingsView({ isDarkMode, toggleTheme, fontSize, onChangeFontSize, onClearHistory }) {

    const handleExportData = () => {
        alert("Функція експорту даних буде доступна незабаром!");
    };

    const handleClearData = () => {
        // Confirmation handled here or in parent? 
        // User asked for confirmation window here.
        if (window.confirm("Ви дійсно хочете видалити всю історію чату? Цю дію неможливо відмінити.")) {
            onClearHistory();
        }
    };

    return (
        <div className="settings-container">
            <h2 className="settings-title">Налаштування</h2>

            <div className="settings-grid">
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

            {/* DISCLAIMER FOOTER */}
            <div className="settings-footer-disclaimer">
                ШІ-асистент не є лікарем. У критичних ситуаціях звертайтеся до фахівців.
            </div>
        </div>
    );
}

export default SettingsView;
