import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CircleDot, Lock, Play, Sparkles } from 'lucide-react';
import { DIFFICULTY_MODE_OPTIONS } from '../../quizConstants';
import { getDifficultyLabel, getDifficultyTimerLabel, getQuestionSetChipColor } from '../../quizUtils';
import { triggerHaptic } from '../../../../utils/haptics';
import { toUiLabelCase } from '../../../../utils/textCase';

const QUESTION_SET_PREVIEW_COUNTS = ['10', '20', '35', '50', '75', '100'];

// Notebook ruled-line background
const RULED_BG = `repeating-linear-gradient(
  transparent, transparent 27px,
  rgba(147, 197, 253, 0.18) 27px, rgba(147, 197, 253, 0.18) 28px
)`;

const SPRING_POP  = { type: 'spring', stiffness: 480, damping: 22 };
const SPRING_SOFT = { type: 'spring', stiffness: 280, damping: 22 };

// Washi tape strip across top of each step card
const WashiStrip = ({ color, rotate = '-1.2deg', width = '80px' }) => null;

// A difficulty button that looks like a coloured index card
const DifficultyBtn = ({ option, isSelected, canPick, onSelect, t, isJapanese }) => (
  <motion.button
    whileHover={canPick ? { y: -3, rotate: 1, scale: 1.04, transition: SPRING_POP } : undefined}
    whileTap={canPick  ? { scale: 0.93, rotate: -2, transition: SPRING_POP } : undefined}
    animate={isSelected ? { scale: [1, 1.08, 0.96, 1.03, 1], rotate: [0, -3, 3, -1, 0] } : { scale: 1 }}
    transition={isSelected ? { duration: 0.38, ease: 'easeOut' } : SPRING_SOFT}
    onClick={() => { if (!canPick) return; triggerHaptic('selection'); onSelect(option.key); }}
    style={{
      position: 'relative',
      background: isSelected ? option.color : '#ffffff',
      border: `2.5px solid ${option.color}`,
      borderBottom: `5px solid ${isSelected ? option.color : option.color}`,
      borderRadius: '14px',
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '6px',
      cursor: canPick ? 'pointer' : 'not-allowed',
      boxShadow: isSelected
        ? `0 8px 20px ${option.color}55, inset 0 1px 0 rgba(255,255,255,0.3)`
        : `0 4px 10px rgba(0,0,0,0.06)`,
      opacity: canPick ? 1 : 0.5,
      transition: 'background 0.15s, box-shadow 0.15s',
      outline: 'none',
    }}
  >
    <div style={{ display: 'grid', gap: '3px', textAlign: 'left' }}>
      <span style={{
        fontFamily: 'Sniglet, var(--font-main)',
        color: isSelected ? '#ffffff' : option.color,
        fontSize: '1rem', lineHeight: 1.1, fontWeight: '400',
      }}>
        {toUiLabelCase(getDifficultyLabel(option.key, t))}
      </span>
      <span style={{
        fontFamily: 'var(--font-hand)',
        color: isSelected ? 'rgba(255,255,255,0.8)' : '#94a3b8',
        fontSize: '0.76rem', lineHeight: 1,
      }}>
        {getDifficultyTimerLabel(option.key, isJapanese ? 'ja' : 'en')}
      </span>
    </div>
    <AnimatePresence>
      {isSelected && (
        <motion.div
          initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
          transition={SPRING_POP}
        >
          <Check size={18} strokeWidth={3} color="#ffffff" />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

// A question count pill button — big circle "stamp" style
const CountBtn = ({ count, isSelected, onSelect }) => {
  const accent = getQuestionSetChipColor(count);
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.1, rotate: -2, transition: SPRING_POP }}
      whileTap={{ scale: 0.88, rotate: 3, transition: SPRING_POP }}
      animate={isSelected ? { scale: [1, 1.18, 0.92, 1.05, 1], rotate: [0, 4, -4, 2, 0] } : { scale: 1 }}
      transition={isSelected ? { duration: 0.42, ease: 'easeOut' } : SPRING_SOFT}
      onClick={() => { triggerHaptic('selection'); onSelect(count); }}
      style={{
        position: 'relative',
        background: isSelected ? accent : '#ffffff',
        border: `3px solid ${accent}`,
        borderBottom: `6px solid ${accent}`,
        borderRadius: '18px',
        padding: '14px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
        cursor: 'pointer',
        boxShadow: isSelected ? `0 8px 22px ${accent}55` : `0 4px 10px ${accent}22`,
        outline: 'none',
        minHeight: '66px',
      }}
    >
      <span style={{
        fontFamily: 'Sniglet, var(--font-main)',
        color: isSelected ? '#ffffff' : accent,
        fontSize: '1.3rem', lineHeight: 1, fontWeight: '400',
      }}>
        {count}
      </span>
      <AnimatePresence>
        {isSelected && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'absolute', top: '-10px', right: '-8px', background: '#fff', borderRadius: '50%',
              border: `2px solid ${accent}`, width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={11} strokeWidth={3.5} color={accent} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Step section header — notebook divider style
const StepHeader = ({ num, label, locked, lockLabel, color, done }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
    <motion.div
      animate={done ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] } : { scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: done ? color : locked ? '#e2e8f0' : color,
        border: `3px solid ${done ? color : locked ? '#cbd5e1' : color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: done ? `0 4px 12px ${color}55` : 'none',
      }}
    >
      {done
        ? <Check size={14} strokeWidth={3.5} color="#fff" />
        : locked
          ? <Lock size={12} strokeWidth={2.5} color="#94a3b8" />
          : <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.75rem', color: '#fff', lineHeight: 1 }}>{num}</span>
      }
    </motion.div>
    <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: '1.05rem', color: locked ? '#94a3b8' : '#1e293b', lineHeight: 1 }}>
      {label}
    </span>
    {locked && (
      <span style={{
        marginLeft: 'auto', fontFamily: 'var(--font-hand)', fontSize: '0.78rem', color: '#94a3b8',
        background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: '999px', padding: '3px 10px',
      }}>
        {lockLabel}
      </span>
    )}
  </div>
);

const QuestionsSetupSection = ({
  isMobile,
  t,
  normalizedQuestions,
  availableQuestionCount,
  playerName,
  setPlayerName,
  questionSet,
  setQuestionSet,
  difficultyMode,
  setDifficultyMode,
  startQuiz,
  isQuestionBankLoading,
  availableQuestionSetOptions,
}) => {
  const selectedDiffOption = DIFFICULTY_MODE_OPTIONS.find(o => o.key === difficultyMode) || null;
  const selectedSetOption  = availableQuestionSetOptions.find(o => o.key === questionSet) || null;
  const [showNameWarning, setShowNameWarning] = useState(false);
  const nameInputRef = useRef(null);

  const hasName        = !!playerName.trim();
  const canDifficulty  = hasName;
  const canQuestions   = hasName && !!difficultyMode;
  const isComplete     = hasName && !!selectedDiffOption && !!selectedSetOption && normalizedQuestions.length > 0;
  const isStartDisabled = isQuestionBankLoading || !isComplete;
  const isJapanese     = t.questionsSuffix === '問';

  useEffect(() => { if (hasName && showNameWarning) setShowNameWarning(false); }, [hasName, showNameWarning]);

  const handleStart = () => {
    if (!hasName) { setShowNameWarning(true); nameInputRef.current?.focus?.(); triggerHaptic('warning'); return; }
    if (isStartDisabled) return;
    triggerHaptic('success');
    startQuiz();
  };

  const cardBase = (bg, border) => ({
    position: 'relative',
    background: bg,
    border: `2.5px solid ${border}`,
    borderBottom: `6px solid ${border}`,
    borderRadius: '20px',
    padding: isMobile ? '16px 14px 14px' : '18px 16px 14px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.07)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, paddingBottom: '24px' }}>

      {/* ── Step 1: Name ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 22, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ ...SPRING_SOFT, delay: 0.04 }}
        style={{ ...cardBase('#eef6ff', '#93c5fd') }}
      >
        <div className="washi-tape washi-tape--blue" style={{ top: '-13px', left: '36px', transform: 'rotate(-2deg)', width: '72px', height: '20px', zIndex: 6 }} />
        <StepHeader num="1" label={toUiLabelCase(t.nameLabel || 'Name')} color="#3b82f6" done={hasName} locked={false} />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={nameInputRef}
              value={playerName}
              onChange={e => { setPlayerName(e.target.value); if (showNameWarning) setShowNameWarning(false); }}
              placeholder={toUiLabelCase(t.namePlaceholder || 'Enter your name')}
              maxLength={24}
              style={{
                width: '100%',
                border: `2.5px solid ${showNameWarning ? '#fca5a5' : '#bfdbfe'}`,
                borderBottom: `5px solid ${showNameWarning ? '#ef4444' : '#3b82f6'}`,
                borderRadius: '14px',
                background: '#ffffff',
                padding: '11px 14px',
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: isMobile ? '1.1rem' : '1.18rem',
                lineHeight: 1.2, fontWeight: '400',
                color: '#1e3a8a', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
          <AnimatePresence>
            {hasName && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                transition={SPRING_POP}
                style={{ flexShrink: 0, width: '38px', height: '38px', background: '#3b82f6', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px #3b82f655' }}
              >
                <Check size={20} strokeWidth={3} color="#fff" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showNameWarning && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ margin: '8px 0 0', color: '#b91c1c', fontFamily: 'var(--font-hand)', fontSize: '0.9rem', lineHeight: 1.4 }}>
              {t.nameRequired}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Steps 2 + 3: side by side ────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '14px',
        alignItems: 'start',
      }}>

        {/* Step 2: Difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 22, rotate: 1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.1 }}
          style={{ ...cardBase('#f5f3ff', '#c4b5fd'), opacity: canDifficulty ? 1 : 0.7 }}
        >
          <div className="washi-tape washi-tape--pink" style={{ top: '-13px', left: '36px', transform: 'rotate(1.5deg)', width: '72px', height: '20px', zIndex: 6 }} />
          <StepHeader
            num="2" label={toUiLabelCase(t.setupDifficultyTitle || 'Difficulty')}
            color="#8b5cf6" done={!!difficultyMode} locked={!canDifficulty}
            lockLabel={t.nameFirst || 'Name first'}
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
            gap: '8px',
            pointerEvents: canDifficulty ? 'auto' : 'none',
          }}>
            {DIFFICULTY_MODE_OPTIONS.map(option => (
              <DifficultyBtn
                key={option.key}
                option={option}
                isSelected={difficultyMode === option.key}
                canPick={canDifficulty}
                onSelect={setDifficultyMode}
                t={t}
                isJapanese={isJapanese}
              />
            ))}
          </div>
        </motion.div>

        {/* Step 3: Question count */}
        <motion.div
          initial={{ opacity: 0, y: 22, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.16 }}
          style={{ ...cardBase('#f0fdf4', '#86efac'), opacity: canQuestions ? 1 : 0.7 }}
        >
          <div className="washi-tape washi-tape--yellow" style={{ top: '-13px', left: '36px', transform: 'rotate(-1deg)', width: '72px', height: '20px', zIndex: 6 }} />
          <StepHeader
            num="3" label={toUiLabelCase(t.setupSetTitle || 'Questions')}
            color="#22c55e" done={!!questionSet} locked={!canQuestions}
            lockLabel={canDifficulty ? (t.difficultyFirst || 'Difficulty first') : (t.nameFirst || 'Name first')}
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
            gap: '8px',
            pointerEvents: canQuestions ? 'auto' : 'none',
            opacity: canQuestions ? 1 : 0.55,
          }}>
            {(canQuestions ? availableQuestionSetOptions : QUESTION_SET_PREVIEW_COUNTS.map(c => ({ key: c, label: c }))).map(option => (
              <CountBtn
                key={option.key}
                count={option.label}
                isSelected={questionSet === option.key}
                onSelect={(lbl) => {
                  const match = availableQuestionSetOptions.find(o => o.label === lbl || o.key === lbl);
                  if (match) setQuestionSet(match.key);
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Review + Start ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_SOFT, delay: 0.22 }}
        style={{
          ...cardBase('var(--surface-card, #fffbeb)', '#fbbf24'),
          borderBottom: '6px solid #d97706',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) auto',
          gap: '12px',
          alignItems: 'center',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <div className="washi-tape washi-tape--yellow" style={{ top: '-13px', left: '36px', transform: 'rotate(1deg)', width: '72px', height: '20px', zIndex: 6 }} />

        <div style={{ display: 'grid', gap: '10px' }}>
          <StepHeader
            num="✓" label={toUiLabelCase(t.reviewBeforeStarting || 'Review before starting')}
            color="#f59e0b" done={isComplete} locked={false}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <ReviewChip color={hasName ? '#3b82f6' : '#94a3b8'} done={hasName}>
              {hasName ? playerName.trim() : (t.namePlaceholder || 'Name')}
            </ReviewChip>
            <ReviewChip color={selectedDiffOption?.color || '#94a3b8'} done={!!selectedDiffOption}>
              {selectedDiffOption ? toUiLabelCase(getDifficultyLabel(selectedDiffOption.key, t)) : (t.setupDifficultyTitle || 'Difficulty')}
            </ReviewChip>
            <ReviewChip color={selectedSetOption ? getQuestionSetChipColor(questionSet) : '#94a3b8'} done={!!selectedSetOption}>
              {selectedSetOption
                ? `${selectedSetOption.label}${isJapanese ? '' : ' '}${t.questionsSuffix || 'questions'}`
                : (t.setupSetTitle || 'Questions')}
            </ReviewChip>
          </div>
        </div>

        {/* Start button */}
        <motion.button
          whileHover={isStartDisabled ? undefined : { scale: 1.06, rotate: -2, y: -3, transition: SPRING_POP }}
          whileTap={isStartDisabled ? undefined : { scale: 0.92, rotate: 1, transition: SPRING_POP }}
          animate={isComplete ? {
            boxShadow: ['0 10px 28px rgba(245,158,11,0.3)', '0 14px 36px rgba(245,158,11,0.5)', '0 10px 28px rgba(245,158,11,0.3)'],
          } : {}}
          transition={isComplete ? { repeat: Infinity, duration: 1.8 } : {}}
          onClick={handleStart}
          disabled={isStartDisabled}
          className="quiz-start-btn"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            minWidth: isMobile ? '100%' : '200px',
            border: `2.5px solid ${isStartDisabled ? '#e2e8f0' : '#d97706'}`,
            borderBottom: `6px solid ${isStartDisabled ? '#cbd5e1' : '#92400e'}`,
            borderRadius: '16px',
            padding: isMobile ? '12px 20px' : '14px 22px',
            background: isStartDisabled ? '#f1f5f9' : '#f59e0b',
            color: isStartDisabled ? '#94a3b8' : '#ffffff',
            fontFamily: 'Sniglet, var(--font-main)', fontWeight: '400',
            fontSize: isMobile ? '1.1rem' : '1.18rem', lineHeight: 1,
            cursor: isStartDisabled ? 'not-allowed' : 'pointer',
            opacity: isStartDisabled ? 0.7 : 1,
            outline: 'none',
            transition: 'background 0.2s, border-color 0.2s, color 0.2s, opacity 0.2s',
          }}
        >
          {isComplete
            ? <Sparkles size={20} strokeWidth={2.4} fill="rgba(255,255,255,0.6)" color="#fff" />
            : <Play size={20} strokeWidth={2.8} fill={isStartDisabled ? '#94a3b8' : '#ffffff'} />
          }
          {toUiLabelCase(t.start || 'Start quiz')}
        </motion.button>
      </motion.div>
    </div>
  );
};

// Small inline component — review chip
const ReviewChip = ({ color, done, children }) => (
  <motion.span
    animate={done ? { scale: [1, 1.1, 1] } : { scale: 1 }}
    transition={{ duration: 0.25 }}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: '#ffffff',
      border: `2px solid ${color}66`,
      borderBottom: `4px solid ${color}`,
      borderRadius: '999px',
      padding: '5px 12px',
      fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.88rem', lineHeight: 1,
      color: done ? color : '#94a3b8', fontWeight: '400',
    }}
  >
    {done && <Check size={11} strokeWidth={3.5} color={color} style={{ flexShrink: 0 }} />}
    {children}
  </motion.span>
);

export default QuestionsSetupSection;
