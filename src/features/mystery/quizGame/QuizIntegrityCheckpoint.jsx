import React from 'react';
import { motion } from 'framer-motion';

void motion;
import { Zap } from 'lucide-react';
import { QuizActionButton, QuizChip, QuizPanel, QUIZ_BUTTON_PALETTES } from './QuizPrimitives';
import { toMysteryLabelCase } from './ui';

const QuizIntegrityCheckpoint = ({ isMobile, integrityCheckpoint, t, onResume }) => {
  const isCalibration = integrityCheckpoint.isCalibration;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ width: '100%', maxWidth: isMobile ? '360px' : '520px', zIndex: 100 }}
    >
      <QuizPanel
        palette={{
          background: isCalibration ? '#fefce8' : '#fff7ed',
          borderColor: isCalibration ? '#fde047' : '#fdba74',
          bottomColor: isCalibration ? '#eab308' : '#f97316',
          shadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}
        style={{
          padding: isMobile ? '20px 16px' : '24px 20px',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={24} color={isCalibration ? '#a16207' : '#9a3412'} fill={isCalibration ? '#fde047' : 'none'} />
          <h3 style={{ color: isCalibration ? '#854d0e' : '#9a3412', fontSize: isMobile ? '1.5rem' : '1.7rem', margin: 0 }}>
            {toMysteryLabelCase(isCalibration ? t.quiz.calibrationTitle : t.quiz.integrityTitle)}
          </h3>
        </div>

        <div style={{ color: isCalibration ? '#713f12' : '#7c2d12', fontSize: '1rem', lineHeight: 1.5, background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '8px', border: `1px dashed ${isCalibration ? '#facc15' : '#fdba74'}` }}>
          {integrityCheckpoint.message}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '0 4px', flexWrap: 'wrap' }}>
          <QuizChip
            palette={{
              background: '#ffffff',
              borderColor: isCalibration ? '#facc15' : '#fdba74',
              bottomColor: isCalibration ? '#eab308' : '#f97316',
              color: '#9a3412',
            }}
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            {toMysteryLabelCase(t.quiz.signalStrength)}: {integrityCheckpoint.integrity}%
          </QuizChip>
          {integrityCheckpoint.reliability != null && (
            <QuizChip
              palette={{
                background: '#ffffff',
                borderColor: isCalibration ? '#facc15' : '#fdba74',
                bottomColor: isCalibration ? '#eab308' : '#f97316',
                color: '#9a3412',
              }}
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              {toMysteryLabelCase(t.quiz.reliability)}: {integrityCheckpoint.reliability}%
            </QuizChip>
          )}
        </div>

        <div style={{ color: '#9a3412', fontSize: '0.82rem', lineHeight: 1.4, opacity: 0.8, textAlign: 'center', fontStyle: 'italic' }}>
          "{t.quiz.instinctNote}"
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <QuizActionButton
            isMobile={isMobile}
            onClick={onResume}
            palette={QUIZ_BUTTON_PALETTES.indigo}
            whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: isMobile ? '12px 28px' : '14px 42px',
              fontSize: '1.25rem',
              borderRadius: '16px',
              boxShadow: '0 8px 0 rgba(15, 23, 42, 0.15)',
            }}
          >
            {toMysteryLabelCase(t.quiz.proceedBtn)}
          </QuizActionButton>
        </div>
      </QuizPanel>
    </motion.div>
  );
};

export default QuizIntegrityCheckpoint;
