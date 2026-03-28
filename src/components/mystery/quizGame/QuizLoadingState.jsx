import React from 'react';
import { ScanSearch } from 'lucide-react';
import { toMysteryLabelCase } from './ui';

const QuizLoadingState = ({ t }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <ScanSearch size={64} color="#3b82f6" className="pulse-slow" />
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '2rem', color: '#1e40af', margin: 0 }}>{toMysteryLabelCase(t.quiz.thinking)}</h3>
        <p style={{ color: '#64748b', fontSize: '1.25rem', margin: '4px 0 0 0' }}>{t.quiz.calculating}</p>
      </div>
    </div>
  );
};

export default QuizLoadingState;
