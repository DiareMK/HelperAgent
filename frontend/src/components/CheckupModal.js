// src/components/CheckupModal.js
import React, { useState } from 'react';
import './CheckupModal.css';

const QUESTIONS = [
    {
        id: 'anxiety',
        text: "Як ти оцінюєш свій рівень тривоги за останні 2 тижні?",
        options: [
            { score: 0, label: "Не турбувало" },
            { score: 1, label: "Кілька днів" },
            { score: 2, label: "Більше половини днів" },
            { score: 3, label: "Майже щодня" }
        ]
    },
    {
        id: 'worry',
        text: "Чи не міг(ла) ти зупинити або контролювати хвилювання?",
        options: [
            { score: 0, label: "Ні" },
            { score: 1, label: "Іноді" },
            { score: 2, label: "Часто" },
            { score: 3, label: "Постійно" }
        ]
    },
    {
        id: 'sleep',
        text: "Чи були проблеми зі сном (важко заснути, неспокійний сон)?",
        options: [
            { score: 0, label: "Ні" },
            { score: 1, label: "Кілька разів" },
            { score: 2, label: "Часто" },
            { score: 3, label: "Майже щоніч" }
        ]
    },
    {
        id: 'restless',
        text: "Чи було важко розслабитися?",
        options: [
            { score: 0, label: "Ні" },
            { score: 1, label: "Трохи" },
            { score: 2, label: "Досить важко" },
            { score: 3, label: "Дуже важко" }
        ]
    }
];

function CheckupModal({ isOpen, onClose, onSave }) {
    const [answers, setAnswers] = useState({});

    if (!isOpen) return null;

    const handleOptionSelect = (questionId, score) => {
        setAnswers(prev => ({ ...prev, [questionId]: score }));
    };

    const calculateResult = () => {
        let totalScore = 0;
        let details = [];

        QUESTIONS.forEach(q => {
            const score = answers[q.id] || 0;
            totalScore += score;
            if (q.id === 'sleep' && score >= 2) details.push("проблеми зі сном");
            if (q.id === 'restless' && score >= 2) details.push("труднощі з розслабленням");
        });

        let severity = "Мінімальна тривожність";
        if (totalScore >= 5) severity = "Помірна тривожність";
        if (totalScore >= 10) severity = "Висока тривожність";

        let summary = `${severity} (Бал: ${totalScore}).`;
        if (details.length > 0) {
            summary += ` Скарги: ${details.join(", ")}.`;
        }

        return summary;
    };

    const handleSubmit = () => {
        // Validate all answered
        if (Object.keys(answers).length < QUESTIONS.length) {
            alert("Будь ласка, дайте відповідь на всі запитання.");
            return;
        }

        const summary = calculateResult();
        onSave(summary);
        onClose();
        setAnswers({}); // Reset for next time
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Швидкий чек-ап (GAD-7)</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {QUESTIONS.map((q, index) => (
                        <div key={q.id} className="checkup-question">
                            <p className="q-text">{index + 1}. {q.text}</p>
                            <div className="q-options">
                                {q.options.map(opt => (
                                    <button
                                        key={opt.score}
                                        className={`opt-btn ${answers[q.id] === opt.score ? 'selected' : ''}`}
                                        onClick={() => handleOptionSelect(q.id, opt.score)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-footer">
                    <button className="submit-btn" onClick={handleSubmit}>
                        Завершити та зберегти
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CheckupModal;
