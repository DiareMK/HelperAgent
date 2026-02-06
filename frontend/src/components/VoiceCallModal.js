// src/components/VoiceCallModal.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VoiceCallModal.css';

const VoiceCallModal = ({ isOpen, onClose, status, transcript }) => {
    // status: 'listening', 'processing', 'speaking'
    // transcript: Real-time text of what user said

    if (!isOpen) return null;

    // Animation Variants - Simplified to avoid glitches
    const circleVariants = {
        listening: {
            scale: [1, 1.15, 1], // Breathing
            opacity: 1,
            backgroundColor: "#4CAF50", // Green
            boxShadow: "0 0 30px rgba(76, 175, 80, 0.5)",
            transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        processing: {
            scale: [1, 0.9, 1],
            rotate: 360, // Spin
            backgroundColor: "#2196F3", // Blue
            boxShadow: "0 0 40px rgba(33, 150, 243, 0.6)",
            borderRadius: "50%",
            transition: {
                rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }
        },
        speaking: {
            scale: [1, 1.1, 1, 1.2, 1], // Vibration
            backgroundColor: "#9C27B0", // Purple
            boxShadow: "0 0 50px rgba(156, 39, 176, 0.7)",
            transition: {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const statusText = {
        listening: "Слухаю вас...",
        processing: "Думаю...",
        speaking: "Відповідаю..."
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="voice-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="voice-content">
                        {/* ANIMATED CIRCLE */}
                        <motion.div
                            className="voice-circle"
                            variants={circleVariants}
                            animate={status}
                        />

                        <div className="text-container">
                            {/* STATUS TEXT */}
                            <motion.p
                                className="voice-status-text"
                                key={status}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {statusText[status]}
                            </motion.p>

                            {/* LIVE TRANSCRIPT */}
                            {transcript && (
                                <motion.p
                                    className="voice-transcript"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    "{transcript}"
                                </motion.p>
                            )}
                        </div>
                    </div>

                    {/* CONTROLS */}
                    <div className="voice-controls">
                        <button className="hangup-btn" onClick={onClose} title="Завершити">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VoiceCallModal;
