import React from 'react';
import { motion } from 'framer-motion';

void motion;
import { UserCheck } from 'lucide-react';
import { toMysteryLabelCase } from './ui';

const QuizIntro = ({ isMobile, t, onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      style={{ textAlign: 'center', width: '100%', maxWidth: isMobile ? '380px' : '480px' }}
    >
      <div
        className="sketchbook-border"
        style={{
          background: '#f8fbff',
          border: '3.5px solid #bfdbfe',
          borderBottom: '9.5px solid #93c5fd',
          borderRadius: '28px',
          padding: isMobile ? '24px 20px' : '32px 24px',
          boxShadow: '0 12px 32px rgba(59, 130, 246, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <UserCheck size={isMobile ? 56 : 72} color="#3b82f6" strokeWidth={3.5} />
        </div>
        <h2 style={{ fontSize: isMobile ? '2.4rem' : '3rem', color: '#1e40af', margin: '0 0 18px 0', transform: 'rotate(-2deg)' }}>
          {toMysteryLabelCase(t.mystery.whoAreYou)}
        </h2>
        <p
          style={{
            fontSize: isMobile ? '1.15rem' : '1.35rem',
            color: '#1e293b',
            marginBottom: '28px',
            lineHeight: 1.5,
            background: '#eff6ff',
            padding: '16px 20px',
            borderRadius: '20px',
            border: '3px dashed #bfdbfe',
          }}
        >
          {t.mystery.whoAreYouDesc}
        </p>
        <motion.button
          whileHover={{ scale: 1.06, rotate: 2, y: -6 }}
          whileTap={{ scale: 0.9, y: 12 }}
          onClick={onStart}
          className="sketchbook-border paper-interact"
          style={{
            background: '#3b82f6',
            color: 'white',
            border: '3.5px solid #2563eb',
            borderBottom: '9.5px solid #1d4ed8',
            padding: isMobile ? '14px 42px' : '18px 64px',
            fontSize: isMobile ? '1.25rem' : '1.45rem',
            cursor: 'pointer',
            borderRadius: '24px',
            boxShadow: '0 10px 0 rgba(37, 99, 235, 0.2)',
          }}
        >
          {toMysteryLabelCase(t.quiz.startBtn)}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default QuizIntro;
