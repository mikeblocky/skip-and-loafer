import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '../../../../utils/haptics';
import { STANCE_PALETTES } from '../config';
import { QuizActionButton, QuizPanel, QUIZ_BUTTON_PALETTES } from '../QuizPrimitives';
import { toMysteryLabelCase } from '../ui';
import {
  QuestionContinueAction,
  QuestionInstructionBlock,
  QuestionMetricCard,
} from './QuestionBlockPrimitives';

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
        <QuestionMetricCard
          palette={{ background: '#eff6ff', borderColor: '#93c5fd', bottomColor: '#2563eb', valueColor: '#1e3a8a' }}
          label={localizedQuestion.lowLabel || question.lowLabel}
          value={`${Math.round((1 - (holdLevel ?? 0)) * 100)}%`}
        />
        <QuestionMetricCard
          palette={{ background: '#fdf2f8', borderColor: '#f9a8d4', bottomColor: '#db2777', valueColor: '#9d174d' }}
          label={localizedQuestion.highLabel || question.highLabel}
          value={`${Math.round((holdLevel ?? 0) * 100)}%`}
        />
      </div>

      <QuizPanel
        palette={{ background: '#f8fafc', borderColor: '#cbd5e1', bottomColor: '#94a3b8' }}
        style={{
          width: '100%',
          padding: isMobile ? '18px 16px' : '22px 18px',
          gap: '14px',
        }}
      >
        <div style={{ width: '100%', height: isMobile ? '18px' : '20px', background: 'rgba(255,255,255,0.65)', borderRadius: '999px', border: '3px solid #cbd5e1', overflow: 'hidden' }}>
          <div style={{ width: `${Math.round((holdLevel ?? 0) * 100)}%`, height: '100%', background: '#60a5fa', transition: holdActive ? 'none' : 'width 140ms ease' }} />
        </div>

        <QuizActionButton
          isMobile={isMobile}
          onPointerDown={startHold}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          palette={QUIZ_BUTTON_PALETTES.whiteSlate}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97, y: 6 }}
          style={{
            padding: isMobile ? '18px 20px' : '22px 26px',
            fontSize: isMobile ? '1.05rem' : '1.15rem',
            boxShadow: '0 8px 20px rgba(100, 116, 139, 0.16)',
          }}
        >
          {toMysteryLabelCase(t.quiz.interactionUi?.pressAndHold || 'Press and hold')}
        </QuizActionButton>
      </QuizPanel>

      <QuestionInstructionBlock isMobile={isMobile}>{getQuestionInstruction(question)}</QuestionInstructionBlock>
      <QuestionContinueAction
        isMobile={isMobile}
        onClick={() => onSubmitHold(question)}
        disabled={!enabled}
        palette={QUIZ_BUTTON_PALETTES.blue}
        marginTop="6px"
      >
        {toMysteryLabelCase(t.quiz.btns.continue)}
      </QuestionContinueAction>
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
        <QuestionMetricCard
          palette={{ background: '#eff6ff', borderColor: '#93c5fd', bottomColor: '#2563eb', valueColor: '#1e3a8a' }}
          label={`${localizedQuestion.slowLabel || question.slowLabel} / ${localizedQuestion.fastLabel || question.fastLabel}`}
          value={rhythmPattern.length >= 2 ? `${Math.round((rhythmPattern[rhythmPattern.length - 1] - rhythmPattern[0]) / Math.max(1, rhythmPattern.length - 1))} ${t.quiz.interactionUi?.averageMs || 'ms avg'}` : (t.quiz.interactionUi?.waiting || 'Waiting')}
        />
        <QuestionMetricCard
          palette={{ background: '#fdf2f8', borderColor: '#f9a8d4', bottomColor: '#db2777', valueColor: '#9d174d' }}
          label={`${localizedQuestion.steadyLabel || question.steadyLabel} / ${localizedQuestion.wildLabel || question.wildLabel}`}
          value={(t.quiz.interactionUi?.tapCount || '{count}/4 taps').replace('{count}', String(rhythmPattern.length)).replace('{total}', '4')}
        />
      </div>

      <QuizActionButton
        isMobile={isMobile}
        onClick={tapRhythm}
        palette={{ background: 'var(--surface-card, #f8fafc)', borderColor: '#cbd5e1', bottomColor: '#94a3b8', color: 'var(--text-primary, #1e293b)', shadow: '0 8px 20px rgba(15, 23, 42, 0.08)' }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.96, y: 6 }}
        style={{
          width: '100%',
          minHeight: isMobile ? '170px' : '190px',
          padding: '18px',
          borderRadius: '30px',
          display: 'grid',
          alignContent: 'center',
          justifyItems: 'center',
          gap: '16px',
          whiteSpace: 'normal',
          height: 'auto',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          {Array.from({ length: 4 }).map((_, index) => {
            const filled = index < rhythmPattern.length;
            return (
              <span key={`rhythm-slot-${index}`} style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', borderRadius: '999px', background: filled ? '#7c3aed' : '#e2e8f0', border: `3px solid ${filled ? '#6d28d9' : '#cbd5e1'}`, boxShadow: filled ? '0 4px 10px rgba(124, 58, 237, 0.28)' : 'none' }} />
            );
          })}
        </div>
        <div style={{ fontFamily: 'var(--font-hand)', color: '#1e293b', fontSize: isMobile ? '1.45rem' : '1.7rem', lineHeight: 1.15, textAlign: 'center', fontWeight: '700' }}>
          {ready ? (t.quiz.interactionUi?.patternCaptured || 'Pattern captured') : (t.quiz.interactionUi?.tapYourPace || 'Tap your pace')}
        </div>
      </QuizActionButton>

      <QuestionInstructionBlock isMobile={isMobile}>{getQuestionInstruction(question)}</QuestionInstructionBlock>
      <QuestionContinueAction
        isMobile={isMobile}
        onClick={() => onSubmitRhythm(question)}
        disabled={!ready}
        palette={QUIZ_BUTTON_PALETTES.violet}
        marginTop="6px"
      >
        {toMysteryLabelCase(t.quiz.btns.continue)}
      </QuestionContinueAction>
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
        <QuizPanel
          palette={{ background: '#eff6ff', borderColor: '#93c5fd', bottomColor: '#2563eb' }}
          style={{ padding: '16px 18px', gap: '10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#1d4ed8', fontSize: '1rem', lineHeight: 1, fontWeight: '400' }}>
              {question.leftLabel || 'A'}
            </span>
            <span style={{ minWidth: '28px', padding: '6px 8px', borderRadius: '999px', background: 'var(--surface-card, #ffffff)', border: '2px solid #93c5fd', color: '#1d4ed8', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400', textAlign: 'center' }}>
              {tradeoffLeft}
            </span>
          </div>
          <div style={{ color: '#1e3a8a', fontSize: '1rem', lineHeight: 1.35, fontWeight: '700' }}>
            {question.left.text}
          </div>
        </QuizPanel>

        <QuizPanel
          palette={{ background: '#fdf2f8', borderColor: '#f9a8d4', bottomColor: '#db2777' }}
          style={{ padding: '16px 18px', gap: '10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#be185d', fontSize: '1rem', lineHeight: 1, fontWeight: '400' }}>
              {question.rightLabel || 'B'}
            </span>
            <span style={{ minWidth: '28px', padding: '6px 8px', borderRadius: '999px', background: 'var(--surface-card, #ffffff)', border: '2px solid #f9a8d4', color: '#be185d', fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400', textAlign: 'center' }}>
              {tradeoffRight}
            </span>
          </div>
          <div style={{ color: '#9d174d', fontSize: '1rem', lineHeight: 1.35, fontWeight: '700' }}>
            {question.right.text}
          </div>
        </QuizPanel>
      </div>

      <div style={{ display: 'grid', gap: '10px', justifyItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <QuizActionButton
            isMobile={isMobile}
            onClick={() => {
              triggerHaptic('selection');
              setTradeoffValue(Math.max(0, tradeoffLeft - 1));
            }}
            palette={QUIZ_BUTTON_PALETTES.whiteSlate}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.9, y: 6 }}
            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '14px' }}
          >
            <ChevronLeft size={18} strokeWidth={2.8} />
          </QuizActionButton>

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

          <QuizActionButton
            isMobile={isMobile}
            onClick={() => {
              triggerHaptic('selection');
              setTradeoffValue(Math.min(tradeoffBudget, tradeoffLeft + 1));
            }}
            palette={QUIZ_BUTTON_PALETTES.whiteSlate}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.9, y: 6 }}
            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '14px' }}
          >
            <ChevronRight size={18} strokeWidth={2.8} />
          </QuizActionButton>
        </div>

        <div style={{ fontFamily: 'var(--font-hand)', color: '#64748b', fontSize: '0.95rem', textAlign: 'center' }}>
          {tradeoffLeft} / {tradeoffRight}
        </div>
      </div>

      <QuestionInstructionBlock isMobile={isMobile}>{getQuestionInstruction(question)}</QuestionInstructionBlock>
      <QuestionContinueAction
        isMobile={isMobile}
        onClick={() => onSubmitTradeoff(question)}
        disabled={false}
        palette={QUIZ_BUTTON_PALETTES.sky}
        marginTop="4px"
      >
        {toMysteryLabelCase(t.quiz.btns.continue)}
      </QuestionContinueAction>
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
          <QuizActionButton
            key={index}
            isMobile={isMobile}
            onClick={() => {
              triggerHaptic('selection');
              setConfidenceSelection((previous) => ({ ...previous, optionIndex: index }));
            }}
            aria-pressed={selected}
            palette={{
              background: 'var(--surface-card, #ffffff)',
              borderColor: selected ? '#3b82f6' : '#cbd5e1',
              bottomColor: selected ? '#2563eb' : '#94a3b8',
              color: 'var(--text-primary, #1e293b)',
              shadow: selected ? '0 6px 0 rgba(37, 99, 235, 0.1)' : '0 4px 0 rgba(0,0,0,0.02)',
            }}
            whileHover={{ scale: 1.02, x: isMobile ? 0 : 8, y: -2 }}
            whileTap={{ scale: 0.95, y: 8 }}
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              textAlign: 'left',
              whiteSpace: 'normal',
              height: 'auto',
              padding: isMobile ? '16px 18px' : '18px 20px',
              lineHeight: 1.35,
            }}
          >
            {option.text}
          </QuizActionButton>
        );
      })}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '2px' }}>
        {[1, 2, 3].map((level) => {
          const active = confidenceSelection.level === level;
          const palette = level === 1
            ? { background: 'var(--surface-card, #f8fafc)', borderColor: '#cbd5e1', bottomColor: '#94a3b8', color: 'var(--text-primary, #475569)', activeBackground: 'var(--surface-card, #fef2f2)', activeBorderColor: '#fca5a5', activeBottomColor: '#ef4444', activeColor: 'var(--text-primary, #7f1d1d)' }
            : level === 2
              ? { background: 'var(--surface-card, #f8fafc)', borderColor: '#cbd5e1', bottomColor: '#94a3b8', color: 'var(--text-primary, #475569)', activeBackground: 'var(--surface-card, #fffbeb)', activeBorderColor: '#fcd34d', activeBottomColor: '#f59e0b', activeColor: 'var(--text-primary, #92400e)' }
              : { background: 'var(--surface-card, #f8fafc)', borderColor: '#cbd5e1', bottomColor: '#94a3b8', color: 'var(--text-primary, #475569)', activeBackground: 'var(--surface-card, #ecfeff)', activeBorderColor: '#67e8f9', activeBottomColor: '#06b6d4', activeColor: 'var(--text-primary, #155e75)' };

          const label = ({
            1: toMysteryLabelCase(t.quiz.intense.subtly),
            2: toMysteryLabelCase(t.quiz.intense.moderately),
            3: toMysteryLabelCase(t.quiz.intense.notably),
          })[level] || '';

          return (
            <QuizActionButton
              key={level}
              isMobile={isMobile}
              onClick={() => {
                triggerHaptic('selection');
                setConfidenceSelection((previous) => ({ ...previous, level }));
              }}
              aria-pressed={active}
              palette={{
                background: active ? palette.activeBackground : palette.background,
                borderColor: active ? palette.activeBorderColor : palette.borderColor,
                bottomColor: active ? palette.activeBottomColor : palette.bottomColor,
                color: active ? palette.activeColor : palette.color,
                shadow: '0 4px 10px rgba(15, 23, 42, 0.05)',
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.9, y: 6 }}
              style={{ padding: '10px 8px', borderRadius: '16px', fontSize: '0.9rem' }}
            >
              {label}
            </QuizActionButton>
          );
        })}
      </div>

      <QuestionInstructionBlock isMobile={isMobile}>{getQuestionInstruction(question)}</QuestionInstructionBlock>
      <QuestionContinueAction
        isMobile={isMobile}
        onClick={() => onSubmitConfidenceChoice(question)}
        disabled={confidenceSelection.optionIndex == null}
        palette={QUIZ_BUTTON_PALETTES.sky}
      >
        {toMysteryLabelCase(t.quiz.btns.continue)}
      </QuestionContinueAction>
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
          const displayLabel = label;
          const palette = STANCE_PALETTES[index] || STANCE_PALETTES[0];
          const active = stanceSelection === index;

          return (
            <QuizActionButton
              key={typeof displayLabel === 'string' ? toMysteryLabelCase(displayLabel) : displayLabel}
              isMobile={isMobile}
              onClick={() => {
                triggerHaptic('success');
                onSubmitStance(question, index);
              }}
              aria-pressed={active}
              palette={{
                background: active ? '#eff6ff' : palette.bg,
                borderColor: active ? '#3b82f6' : palette.border,
                bottomColor: active ? '#2563eb' : palette.bottom,
                color: active ? '#1e40af' : palette.text,
                shadow: '0 4px 10px rgba(15, 23, 42, 0.05)',
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.9, y: 8 }}
              style={{ padding: isMobile ? '14px 10px' : '16px 12px', textAlign: 'center', borderRadius: '20px', fontSize: isMobile ? '0.95rem' : '1rem', lineHeight: 1.2 }}
            >
              {typeof displayLabel === 'string' ? toMysteryLabelCase(displayLabel) : displayLabel}
            </QuizActionButton>
          );
        })}
      </div>
      <QuestionInstructionBlock isMobile={isMobile}>{getQuestionInstruction(question)}</QuestionInstructionBlock>
    </div>
  );
});
