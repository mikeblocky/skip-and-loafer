import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '../../../../utils/haptics';
import { STANCE_PALETTES } from '../config';
import { instructionStyle } from '../interactive/utils';
import { toMysteryLabelCase } from '../ui';

const continueButtonStyle = (enabled, palette, isMobile) => ({
  background: enabled ? palette.bg : '#94a3b8',
  color: 'white',
  border: `3.5px solid ${palette.border}`,
  borderBottom: `9.5px solid ${palette.bottom}`,
  padding: isMobile ? '12px 32px' : '14px 48px',
  fontFamily: 'var(--font-main)',
  fontSize: '1.15rem',
  cursor: enabled ? 'pointer' : 'not-allowed',
  borderRadius: '24px',
  fontWeight: 'bold',
  boxShadow: enabled ? palette.shadow : 'none',
  opacity: enabled ? 1 : 0.6,
});

export const HoldQuestion = React.memo(function HoldQuestion({
  getQuestionInstruction,
  holdActive,
  holdLevel,
  isMobile,
  localizedQuestion,
  onSubmitHold,
  question,
  startHold,
  stopHold,
  t,
}) {
  const enabled = (holdLevel ?? 0) > 0;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%' }}>
        <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3px solid #93c5fd', borderBottom: '7px solid #2563eb', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
          <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>{localizedQuestion.lowLabel || question.lowLabel}</span>
          <span style={{ color: '#1e3a8a', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>{Math.round((1 - (holdLevel ?? 0)) * 100)}%</span>
        </div>
        <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3px solid #f9a8d4', borderBottom: '7px solid #db2777', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
          <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>{localizedQuestion.highLabel || question.highLabel}</span>
          <span style={{ color: '#9d174d', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>{Math.round((holdLevel ?? 0) * 100)}%</span>
        </div>
      </div>

      <div className="sketchbook-border" style={{ width: '100%', background: '#f8fafc', border: '3.5px solid #cbd5e1', borderBottom: '9.5px solid #94a3b8', borderRadius: '28px', padding: isMobile ? '18px 16px' : '22px 18px', display: 'grid', gap: '14px' }}>
        <div style={{ width: '100%', height: isMobile ? '18px' : '20px', background: 'rgba(255,255,255,0.65)', borderRadius: '999px', border: '3px solid #cbd5e1', overflow: 'hidden' }}>
          <div style={{ width: `${Math.round((holdLevel ?? 0) * 100)}%`, height: '100%', background: '#60a5fa', transition: holdActive ? 'none' : 'width 140ms ease' }} />
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97, y: 6 }}
          onPointerDown={startHold}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          className="sketchbook-border paper-interact"
          style={{ background: '#ffffff', border: '3.5px solid #94a3b8', borderBottom: '9.5px solid #64748b', color: '#334155', padding: isMobile ? '18px 20px' : '22px 26px', fontFamily: 'var(--font-main)', fontSize: isMobile ? '1.05rem' : '1.15rem', cursor: 'pointer', borderRadius: '24px', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(100, 116, 139, 0.16)' }}
        >
          {toMysteryLabelCase(t.quiz.interactionUi?.pressAndHold || 'Press and hold')}
        </motion.button>
      </div>

      <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.92, y: 10 }}
          onClick={() => onSubmitHold(question)}
          disabled={!enabled}
          className="sketchbook-border paper-interact"
          style={continueButtonStyle(enabled, { bg: '#3b82f6', border: '#2563eb', bottom: '#1d4ed8', shadow: '0 10px 24px rgba(59, 130, 246, 0.3)' }, isMobile)}
        >
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </motion.button>
      </div>
    </div>
  );
});

export const RhythmQuestion = React.memo(function RhythmQuestion({
  getQuestionInstruction,
  isMobile,
  localizedQuestion,
  onSubmitRhythm,
  question,
  rhythmPattern,
  t,
  tapRhythm,
}) {
  const ready = rhythmPattern.length >= 4;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%' }}>
        <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3px solid #93c5fd', borderBottom: '7px solid #2563eb', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
          <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>{localizedQuestion.slowLabel || question.slowLabel} / {localizedQuestion.fastLabel || question.fastLabel}</span>
          <span style={{ color: '#1e3a8a', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
            {rhythmPattern.length >= 2 ? `${Math.round((rhythmPattern[rhythmPattern.length - 1] - rhythmPattern[0]) / Math.max(1, rhythmPattern.length - 1))} ${t.quiz.interactionUi?.averageMs || 'ms avg'}` : (t.quiz.interactionUi?.waiting || 'Waiting')}
          </span>
        </div>
        <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3px solid #f9a8d4', borderBottom: '7px solid #db2777', borderRadius: '18px', padding: '10px 12px', display: 'grid', gap: '6px' }}>
          <span style={{ color: '#64748b', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.84rem', lineHeight: 1, fontWeight: '400' }}>{localizedQuestion.steadyLabel || question.steadyLabel} / {localizedQuestion.wildLabel || question.wildLabel}</span>
          <span style={{ color: '#9d174d', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.2, fontWeight: '700' }}>
            {(t.quiz.interactionUi?.tapCount || '{count}/4 taps')
              .replace('{count}', String(rhythmPattern.length))
              .replace('{total}', '4')}
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.96, y: 6 }}
        onClick={tapRhythm}
        className="sketchbook-border paper-interact"
        style={{ width: '100%', minHeight: isMobile ? '170px' : '190px', background: '#f8fafc', border: '3.5px solid #cbd5e1', borderBottom: '9.5px solid #94a3b8', borderRadius: '30px', display: 'grid', alignContent: 'center', justifyItems: 'center', gap: '16px', cursor: 'pointer', padding: '18px' }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          {Array.from({ length: 4 }).map((_, index) => {
            const filled = index < rhythmPattern.length;
            return (
              <span key={`rhythm-slot-${index}`} style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', borderRadius: '999px', background: filled ? '#7c3aed' : '#e2e8f0', border: `3px solid ${filled ? '#6d28d9' : '#cbd5e1'}`, boxShadow: filled ? '0 4px 10px rgba(124, 58, 237, 0.28)' : 'none' }} />
            );
          })}
        </div>
        <div style={{ fontFamily: 'var(--font-hand)', color: '#1e293b', fontSize: isMobile ? '1.45rem' : '1.7rem', lineHeight: 1.15, textAlign: 'center', fontWeight: 'bold' }}>
          {ready ? (t.quiz.interactionUi?.patternCaptured || 'Pattern captured') : (t.quiz.interactionUi?.tapYourPace || 'Tap your pace')}
        </div>
      </motion.button>

      <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.92, y: 10 }}
          onClick={() => onSubmitRhythm(question)}
          disabled={!ready}
          className="sketchbook-border paper-interact"
          style={continueButtonStyle(ready, { bg: '#7c3aed', border: '#6d28d9', bottom: '#5b21b6', shadow: '0 10px 24px rgba(124, 58, 237, 0.3)' }, isMobile)}
        >
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </motion.button>
      </div>
    </div>
  );
});

export const TradeoffQuestion = React.memo(function TradeoffQuestion({
  getQuestionInstruction,
  isMobile,
  onSubmitTradeoff,
  question,
  setTradeoffValue,
  t,
  tradeoffBudget,
  tradeoffLeft,
  tradeoffRight,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
        <div className="sketchbook-border" style={{ background: '#eff6ff', border: '3.5px solid #93c5fd', borderBottom: '9.5px solid #2563eb', borderRadius: '24px', padding: '16px 18px', display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#1d4ed8', fontSize: '1rem', lineHeight: 1, fontWeight: '400' }}>
              {t.quiz.questions[question.id]?.leftLabel || question.leftLabel || 'A'}
            </span>
            <span style={{ minWidth: '28px', padding: '6px 8px', borderRadius: '999px', background: '#ffffff', border: '2px solid #93c5fd', color: '#1d4ed8', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400', textAlign: 'center' }}>
              {tradeoffLeft}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-main)', color: '#1e3a8a', fontSize: '1rem', lineHeight: 1.35, fontWeight: 'bold' }}>
            {t.quiz.questions[question.id]?.left || question.left.text}
          </div>
        </div>

        <div className="sketchbook-border" style={{ background: '#fdf2f8', border: '3.5px solid #f9a8d4', borderBottom: '9.5px solid #db2777', borderRadius: '24px', padding: '16px 18px', display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#be185d', fontSize: '1rem', lineHeight: 1, fontWeight: '400' }}>
              {t.quiz.questions[question.id]?.rightLabel || question.rightLabel || 'B'}
            </span>
            <span style={{ minWidth: '28px', padding: '6px 8px', borderRadius: '999px', background: '#ffffff', border: '2px solid #f9a8d4', color: '#be185d', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400', textAlign: 'center' }}>
              {tradeoffRight}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-main)', color: '#9d174d', fontSize: '1rem', lineHeight: 1.35, fontWeight: 'bold' }}>
            {t.quiz.questions[question.id]?.right || question.right.text}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '10px', justifyItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.9, y: 6 }}
            onClick={() => {
              triggerHaptic('selection');
              setTradeoffValue(Math.max(0, tradeoffLeft - 1));
            }}
            className="sketchbook-border paper-interact"
            style={{ background: '#ffffff', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', width: '40px', height: '40px', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} strokeWidth={2.8} />
          </motion.button>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: tradeoffBudget }).map((_, index) => {
              const selected = index < tradeoffLeft;

              return (
                <motion.button
                  key={`tradeoff-${index}`}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.92, y: 4 }}
                  onClick={() => {
                    triggerHaptic('selection');
                    setTradeoffValue(index + 1);
                  }}
                  className="sketchbook-border paper-interact"
                  style={{ width: '28px', height: '28px', borderRadius: '999px', background: selected ? '#93c5fd' : '#f9a8d4', border: `3px solid ${selected ? '#2563eb' : '#db2777'}`, boxShadow: selected ? '0 4px 10px rgba(37, 99, 235, 0.18)' : '0 4px 10px rgba(219, 39, 119, 0.18)', cursor: 'pointer' }}
                />
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.9, y: 6 }}
            onClick={() => {
              triggerHaptic('selection');
              setTradeoffValue(Math.min(tradeoffBudget, tradeoffLeft + 1));
            }}
            className="sketchbook-border paper-interact"
            style={{ background: '#ffffff', border: '3px solid #cbd5e1', borderBottom: '7px solid #94a3b8', width: '40px', height: '40px', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}
          >
            <ChevronRight size={18} strokeWidth={2.8} />
          </motion.button>
        </div>

        <div style={{ fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: '0.95rem', textAlign: 'center' }}>
          {tradeoffLeft} / {tradeoffRight}
        </div>
      </div>

      <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.92, y: 10 }}
          onClick={() => onSubmitTradeoff(question)}
          className="sketchbook-border paper-interact"
          style={continueButtonStyle(true, { bg: '#0ea5e9', border: '#0284c7', bottom: '#0369a1', shadow: '0 10px 24px rgba(14, 165, 233, 0.3)' }, isMobile)}
        >
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </motion.button>
      </div>
    </div>
  );
});

export const ConfidenceChoiceQuestion = React.memo(function ConfidenceChoiceQuestion({
  confidenceSelection,
  getQuestionInstruction,
  isMobile,
  onSubmitConfidenceChoice,
  question,
  setConfidenceSelection,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {(question.options || []).map((option, index) => {
        const selected = confidenceSelection.optionIndex === index;

        return (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02, x: isMobile ? 0 : 8, y: -2 }}
            whileTap={{ scale: 0.95, y: 8 }}
            onClick={() => {
              triggerHaptic('selection');
              setConfidenceSelection((previous) => ({ ...previous, optionIndex: index }));
            }}
            className="sketchbook-border paper-interact"
            style={{ background: selected ? '#eff6ff' : '#ffffff', border: `3.5px solid ${selected ? '#3b82f6' : '#cbd5e1'}`, borderBottom: `9.5px solid ${selected ? '#2563eb' : '#94a3b8'}`, padding: isMobile ? '16px 18px' : '18px 20px', fontFamily: 'var(--font-main)', color: selected ? '#1e40af' : '#1e293b', fontSize: '1.05rem', lineHeight: 1.35, textAlign: 'left', cursor: 'pointer', borderRadius: '24px', fontWeight: 'bold', boxShadow: selected ? '0 6px 0 rgba(37, 99, 235, 0.1)' : '0 4px 0 rgba(0,0,0,0.02)' }}
          >
            {t.quiz.questions[question.id]?.options?.[index] || option.text}
          </motion.button>
        );
      })}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '2px' }}>
        {[1, 2, 3].map((level) => {
          const active = confidenceSelection.level === level;
          const palette = level === 1
            ? { bg: '#f8fafc', border: '#cbd5e1', bottom: '#94a3b8', text: '#475569', activeBg: '#fef2f2', activeBorder: '#fca5a5', activeBottom: '#ef4444', activeText: '#7f1d1d' }
            : level === 2
              ? { bg: '#f8fafc', border: '#cbd5e1', bottom: '#94a3b8', text: '#475569', activeBg: '#fffbeb', activeBorder: '#fcd34d', activeBottom: '#f59e0b', activeText: '#92400e' }
              : { bg: '#f8fafc', border: '#cbd5e1', bottom: '#94a3b8', text: '#475569', activeBg: '#ecfeff', activeBorder: '#67e8f9', activeBottom: '#06b6d4', activeText: '#155e75' };
          const label = ({
            1: toMysteryLabelCase(t.quiz.intense.subtly),
            2: toMysteryLabelCase(t.quiz.intense.moderately),
            3: toMysteryLabelCase(t.quiz.intense.notably),
          })[level] || '';

          return (
            <motion.button
              key={level}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.9, y: 6 }}
              onClick={() => {
                triggerHaptic('selection');
                setConfidenceSelection((previous) => ({ ...previous, level }));
              }}
              className="sketchbook-border paper-interact"
              style={{ background: active ? palette.activeBg : palette.bg, border: `3px solid ${active ? palette.activeBorder : palette.border}`, borderBottom: `7px solid ${active ? palette.activeBottom : palette.bottom}`, color: active ? palette.activeText : palette.text, padding: '10px 8px', fontFamily: 'var(--font-main)', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '16px', fontWeight: 'bold' }}
            >
              {label}
            </motion.button>
          );
        })}
      </div>

      <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.92, y: 10 }}
          onClick={() => onSubmitConfidenceChoice(question)}
          disabled={confidenceSelection.optionIndex == null}
          className="sketchbook-border paper-interact"
          style={continueButtonStyle(confidenceSelection.optionIndex != null, { bg: '#0ea5e9', border: '#0284c7', bottom: '#0369a1', shadow: '0 10px 24px rgba(14, 165, 233, 0.3)' }, isMobile)}
        >
          {toMysteryLabelCase(t.quiz.btns.continue)}
        </motion.button>
      </div>
    </div>
  );
});

export const StanceQuestion = React.memo(function StanceQuestion({
  getQuestionInstruction,
  isMobile,
  onSubmitStance,
  question,
  stanceSelection,
  t,
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '8px' }}>
        {(question.labels || [t.quiz.btns.false, t.quiz.intense.subtly, t.quiz.intense.moderately, t.quiz.btns.true]).map((label, index) => {
          const displayLabel = t.quiz.questions[question.id]?.options?.[index] || label;
          const palette = STANCE_PALETTES[index] || STANCE_PALETTES[0];
          const active = stanceSelection === index;

          return (
            <motion.button
              key={typeof displayLabel === 'string' ? toMysteryLabelCase(displayLabel) : displayLabel}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.9, y: 8 }}
              onClick={() => {
                triggerHaptic('success');
                onSubmitStance(question, index);
              }}
              className="sketchbook-border paper-interact"
              style={{ background: active ? '#eff6ff' : palette.bg, border: `3.5px solid ${active ? '#3b82f6' : palette.border}`, borderBottom: `9.5px solid ${active ? '#2563eb' : palette.bottom}`, padding: isMobile ? '14px 10px' : '16px 12px', fontFamily: 'var(--font-main)', color: active ? '#1e40af' : palette.text, fontSize: isMobile ? '0.95rem' : '1rem', lineHeight: 1.2, cursor: 'pointer', textAlign: 'center', borderRadius: '20px', fontWeight: 'bold' }}
            >
              {typeof displayLabel === 'string' ? toMysteryLabelCase(displayLabel) : displayLabel}
            </motion.button>
          );
        })}
      </div>
      <div style={instructionStyle(isMobile)}>{getQuestionInstruction(question)}</div>
    </div>
  );
});
