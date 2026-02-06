// src/components/VoiceCallModal.js
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VoiceCallModal.css';

const VoiceCallModal = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState('listening'); // 'listening', 'processing', 'speaking'

    // Simulation of conversation flow for demo purposes
    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setStatus(prev => {
                if (prev === 'listening') return 'processing';
                if (prev === 'processing') return 'speaking';
                return 'listening';
            });
        }, 4000); // Change state every 4 seconds

        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    // Animation Variants
    const circleVariants = {
        listening: {
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
            backgroundColor: "#4CAF50", // Green
            boxShadow: "0 0 20px rgba(76, 175, 80, 0.4)",
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        processing: {
            scale: [1, 0.9, 1],
            rotate: [0, 360],
            backgroundColor: "#2196F3", // Blue
            boxShadow: "0 0 30px rgba(33, 150, 243, 0.5)",
            borderRadius: ["50%", "40%", "50%"], // Slight morph
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "linear" // Spin
            }
        },
        speaking: {
            scale: [1, 1.2, 0.9, 1.15, 1], // Random-ish vibration
            backgroundColor: "#9C27B0", // Purple
            boxShadow: "0 0 40px rgba(156, 39, 176, 0.6)",
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const statusText = {
        listening: "Слухаю...",
        processing: "Думаю...",
        speaking: "Говорить..."
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

                        {/* STATUS TEXT */}
                        <motion.p
                            className="voice-status-text"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            key={status} // Re-animate on status change
                        >
                            {statusText[status]}
                        </motion.p>
                    </div>

                    {/* CONTROLS */}
                    <div className="voice-controls">
                        <button className="hangup-btn" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VoiceCallModal;
