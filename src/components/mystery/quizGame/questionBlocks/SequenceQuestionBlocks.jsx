import React from 'react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '../../../../utils/haptics';
import { instructionStyle } from '../interactive/utils';
import { toMysteryLabelCase } from '../ui';

const sharedContinueButtonStyle = (enabled, palette, isMobile) => ({
  background: enabled ? palette.bg : '#94a3b8',
  color: 'white',
  border: `3.5px solid ${palette.border}`,
  borderBottom: `9.5px solid ${palette.bottom}`,
  opacity: enabled ? 1 : 0.6,
  padding: isMobile ? '12px 32px' : '14px 48px',
  fontFamily: 'var(--font-main)',
  fontSize: '1.15rem',
  cursor: enabled ? 'pointer' : 'not-allowed',
  borderRadius: '24px',
  fontWeight: 'bold',
  boxShadow: enabled ? palette.shadow : 'none',
});

export const Sort4Question = React.memo(function Sort4Question({
  getQuestionInstruction,
  isMobile,
  onSubmitSort4,
  question,
  setSortSelection,
  sortSelection,
  sortTarget,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'grid', gap: '10px' }}>
        {(question.options || []).map((option, index) => {
          const order = sortSelection.indexOf(index);
          const selected = order !== -1;
          const palette = selected
            ? { bg: '#eff6ff', border: '#60a5fa', bottom: '#2563eb', text: '#1d4ed8' }
            : { bg: '#ffffff', border: '#cbd5e1', bottom: '#94a3b8', text: '#1e293b' };

          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02, x: isMobile ? 0 : 8, y: -2 }}
              whileTap={{ scale: 0.95, y: 8 }}
              onClick={() => {
                triggerHaptic('selection');
                setSortSelection((previous) => {
                  if (previous.includes(index)) {
                    return previous.filter((value) => value !== index);
                  }

                  if (previous.length >= sortTarget) {
                    return [...previous.slice(1), index];
                  }

                  return [...previous, index];
                });
              }}
              className="sketchbook-border paper-interact"
              style={{ background: palette.bg, border: `3.5px solid ${palette.border}`, borderBottom: `9.5px solid ${palette.bottom}`, padding: isMobile ? '14px 16px' : '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px', alignItems: 'center', borderRadius: '24px', cursor: 'pointer', boxShadow: selected ? '0 8px 18px rgba(37, 99, 235, 0.16)' : '0 4px 0 rgba(0,0,0,0.02)' }}
            >
              <span style={{ width: '32px', height: '32px', borderRadius: '12px', border: `3px solid ${selected ? '#60a5fa' : '#cbd5e1'}`, background: selected ? '#dbeafe' : '#f8fafc', color: selected ? '#1d4ed8' : '#94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.95rem', lineHeight: 1, fontWeight: '400' }}>
                {selected ? order + 1 : ''}
              </span>
              <span style={{ fontFamily: 'var(--font-main)', color: palette.text, fontSize: '1.02rem', lineHeight: 1.3, fontWeight: 'bold', textAlign: 'left' }}>
                {t.quiz.questions[question.id]?.options?.[index] || option.text}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}>
        {[...Array(sortTarget)].map((_, slot) => {
          const selectedIndex = sortSelection[slot];
          const slotLabel = selectedIndex != null
            ? (t.quiz.questions[question.id]?.options?.[selectedIndex] || question.options?.[selectedIndex]?.text)
            : '...';
          const slotTitle = slot === 0
            ? toMysteryLabelCase(t.quiz.btns.mostLikeMe)
            : slot === (sortTarget - 1)
              ? toMysteryLabelCase(t.quiz.btns.leastLikeMe)
              : `#${slot + 1}`;

          return (
            <div key={`sort-slot-${slot}`} className="sketchbook-border" style={{ flex: '1 1 120px', background: '#f8fafc', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>{slotTitle}</span>
              <span style={{ color: '#334155', fontFamily: 'var(--font-main)', fontSize: '0.86rem', lineHeight: 1.2, fontWeight: '700' }}>{slotLabel}</span>
            </div>
          );
        })}
      </div>

      <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.92, y: 10 }}
          onClick={() => onSubmitSort4(question)}
          disabled={sortSelection.length < sortTarget}
          className="sketchbook-border paper-interact"
          style={sharedContinueButtonStyle(sortSelection.length >= sortTarget, { bg: '#3b82f6', border: '#2563eb', bottom: '#1d4ed8', shadow: '0 10px 24px rgba(59, 130, 246, 0.3)' }, isMobile)}
        >
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </motion.button>
      </div>
    </div>
  );
});

export const PairMatchQuestion = React.memo(function PairMatchQuestion({
  getQuestionInstruction,
  isMobile,
  onSubmitPairMatch,
  pairMatchSelection,
  pairTarget,
  question,
  setPairMatchSelection,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
        {(question.options || []).map((option, index) => {
          const selected = pairMatchSelection.includes(index);
          const order = pairMatchSelection.indexOf(index);
          const palette = selected
            ? { bg: '#eff6ff', border: '#60a5fa', bottom: '#2563eb', text: '#1d4ed8' }
            : { bg: '#ffffff', border: '#cbd5e1', bottom: '#94a3b8', text: '#334155' };

          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95, y: 8 }}
              onClick={() => {
                triggerHaptic('selection');
                setPairMatchSelection((previous) => {
                  if (previous.includes(index)) {
                    return previous.filter((value) => value !== index);
                  }

                  if (previous.length >= pairTarget) {
                    return [...previous.slice(1), index];
                  }

                  return [...previous, index];
                });
              }}
              className="sketchbook-border paper-interact"
              style={{ background: palette.bg, border: `3.5px solid ${palette.border}`, borderBottom: `9.5px solid ${palette.bottom}`, padding: isMobile ? '14px 12px' : '16px 14px', minHeight: isMobile ? '102px' : '114px', display: 'grid', gap: '10px', alignContent: 'space-between', textAlign: 'left', borderRadius: '24px', cursor: 'pointer', boxShadow: selected ? '0 8px 18px rgba(37, 99, 235, 0.16)' : '0 4px 0 rgba(0,0,0,0.02)' }}
            >
              <span style={{ width: '30px', height: '30px', borderRadius: '12px', border: `3px solid ${selected ? '#60a5fa' : '#cbd5e1'}`, background: selected ? '#dbeafe' : '#f8fafc', color: selected ? '#1d4ed8' : '#94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400' }}>
                {selected ? order + 1 : ''}
              </span>
              <span style={{ fontFamily: 'var(--font-main)', color: palette.text, fontSize: isMobile ? '0.96rem' : '1rem', lineHeight: 1.28, fontWeight: 'bold' }}>
                {t.quiz.questions[question.id]?.options?.[index] || option.text}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
        {Array.from({ length: pairTarget }).map((_, slot) => {
          const selectedIndex = pairMatchSelection[slot];
          const slotLabel = selectedIndex != null
            ? (t.quiz.questions[question.id]?.options?.[selectedIndex] || question.options?.[selectedIndex]?.text)
            : '...';

          return (
            <div key={`pair-slot-${slot}`} className="sketchbook-border" style={{ background: '#f8fafc', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>#{slot + 1}</span>
              <span style={{ color: '#334155', fontFamily: 'var(--font-main)', fontSize: '0.86rem', lineHeight: 1.2, fontWeight: '700' }}>{slotLabel}</span>
            </div>
          );
        })}
      </div>

      <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.92, y: 10 }}
          onClick={() => onSubmitPairMatch(question)}
          disabled={pairMatchSelection.length < pairTarget}
          className="sketchbook-border paper-interact"
          style={sharedContinueButtonStyle(pairMatchSelection.length >= pairTarget, { bg: '#3b82f6', border: '#2563eb', bottom: '#1d4ed8', shadow: '0 10px 24px rgba(59, 130, 246, 0.3)' }, isMobile)}
        >
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </motion.button>
      </div>
    </div>
  );
});

export const ConstellationQuestion = React.memo(function ConstellationQuestion({
  constellationSelection,
  constellationTarget,
  getQuestionInstruction,
  isMobile,
  onSubmitConstellation,
  question,
  setConstellationSelection,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 2fr' : 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
        {(question.options || []).map((option, index) => {
          const selected = constellationSelection.includes(index);
          const order = constellationSelection.indexOf(index);
          const palette = selected
            ? { bg: '#eff6ff', border: '#60a5fa', bottom: '#2563eb', text: '#1d4ed8' }
            : { bg: '#ffffff', border: '#cbd5e1', bottom: '#94a3b8', text: '#334155' };

          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95, y: 8 }}
              onClick={() => {
                triggerHaptic('selection');
                setConstellationSelection((previous) => {
                  if (previous.includes(index)) {
                    return previous.filter((value) => value !== index);
                  }
                  if (previous.length >= constellationTarget) {
                    return [...previous.slice(1), index];
                  }
                  return [...previous, index];
                });
              }}
              className="sketchbook-border paper-interact"
              style={{ background: palette.bg, border: `3.5px solid ${palette.border}`, borderBottom: `9.5px solid ${palette.bottom}`, padding: isMobile ? '14px 12px' : '16px 14px', minHeight: isMobile ? '102px' : '114px', display: 'grid', gap: '10px', alignContent: 'space-between', textAlign: 'left', borderRadius: '24px', cursor: 'pointer', boxShadow: selected ? '0 8px 18px rgba(37, 99, 235, 0.16)' : '0 4px 0 rgba(0,0,0,0.02)' }}
            >
              <span style={{ width: '30px', height: '30px', borderRadius: '12px', border: `3px solid ${selected ? '#60a5fa' : '#cbd5e1'}`, background: selected ? '#dbeafe' : '#f8fafc', color: selected ? '#1d4ed8' : '#94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400' }}>
                {selected ? order + 1 : ''}
              </span>
              <span style={{ fontFamily: 'var(--font-main)', color: palette.text, fontSize: isMobile ? '0.96rem' : '1rem', lineHeight: 1.28, fontWeight: 'bold' }}>
                {t.quiz.questions[question.id]?.options?.[index] || option.text}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
        {Array.from({ length: constellationTarget }).map((_, slot) => {
          const selectedIndex = constellationSelection[slot];
          const slotLabel = selectedIndex != null
            ? (t.quiz.questions[question.id]?.options?.[selectedIndex] || question.options?.[selectedIndex]?.text)
            : '...';

          return (
            <div key={`constellation-slot-${slot}`} className="sketchbook-border" style={{ background: '#f8fafc', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
              <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>#{slot + 1}</span>
              <span style={{ color: '#334155', fontFamily: 'var(--font-main)', fontSize: '0.86rem', lineHeight: 1.2, fontWeight: '700' }}>{slotLabel}</span>
            </div>
          );
        })}
      </div>

      <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.92, y: 10 }}
          onClick={() => onSubmitConstellation(question)}
          disabled={constellationSelection.length < constellationTarget}
          className="sketchbook-border paper-interact"
          style={sharedContinueButtonStyle(constellationSelection.length >= constellationTarget, { bg: '#7c3aed', border: '#6d28d9', bottom: '#5b21b6', shadow: '0 10px 24px rgba(124, 58, 237, 0.3)' }, isMobile)}
        >
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </motion.button>
      </div>
    </div>
  );
});
