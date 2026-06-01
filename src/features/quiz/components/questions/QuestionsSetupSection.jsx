import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CircleDot, Gauge, Lock, Play, Rows3, UserRound } from 'lucide-react';
import { DIFFICULTY_MODE_OPTIONS } from '../../quizConstants';
import { getDifficultyLabel, getDifficultyTimerLabel, getQuestionSetChipColor } from '../../quizUtils';
import { triggerHaptic } from '../../../../utils/haptics';
import { toUiLabelCase } from '../../../../utils/textCase';

const PANEL_TRANSITION = { type: 'spring', stiffness: 320, damping: 20 };
const QUESTION_SET_PREVIEW_COUNTS = ['10', '20', '35', '50', '75', '100'];

const panelStyle = (background, border, bottom) => ({
  background,
  border: `2.5px solid ${border}`,
  borderBottom: `6px solid ${bottom}`,
  borderRadius: '28px',
  boxShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
});

const sectionTitleStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: 'Sniglet, var(--font-main)',
  fontSize: '1.02rem',
  lineHeight: 1,
  fontWeight: '400',
  color: '#0f172a',
};

const StepCard = ({
  isMobile,
  title,
  description,
  stepLabel,
  icon: Icon,
  locked = false,
  lockedLabel,
  children,
  background = '#ffffff',
  border = '#dbe4f0',
  bottom = '#b8c7da',
}) => (
  <div
    className="sketchbook-border"
    style={{
      ...panelStyle(background, border, bottom),
      padding: isMobile ? '10px 12px' : '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      minHeight: isMobile ? 'auto' : '230px',
      opacity: locked ? 0.52 : 1,
      filter: locked ? 'grayscale(0.35)' : 'none',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
      <div style={{ display: 'grid', gap: '6px' }}>
        <span style={sectionTitleStyle}>
          <Icon size={18} strokeWidth={2.4} />
          {stepLabel}
        </span>
        <h2
          style={{
            margin: 0,
            fontFamily: 'Sniglet, var(--font-main)',
            fontSize: isMobile ? '1.4rem' : '1.55rem',
            lineHeight: 1.08,
            fontWeight: '400',
            color: '#0f172a',
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-main)',
              color: '#475569',
              fontSize: isMobile ? '0.94rem' : '0.98rem',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {locked && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 10px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.8)',
            border: '2px solid rgba(148,163,184,0.55)',
            color: '#64748b',
            fontFamily: 'Sniglet, var(--font-main)',
            fontSize: '0.8rem',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          <Lock size={14} strokeWidth={2.4} />
          {lockedLabel}
        </span>
      )}
    </div>

    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
      {locked && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '20px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(248,250,252,0.68))',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
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
  const selectedQuestionSet = availableQuestionSetOptions.find((option) => option.key === questionSet) || null;
  const selectedDifficultyOption = DIFFICULTY_MODE_OPTIONS.find((option) => option.key === difficultyMode) || null;
  const [showNameWarning, setShowNameWarning] = useState(false);
  const nameInputRef = useRef(null);
  const hasPlayerName = !!playerName.trim();
  const canPickDifficulty = hasPlayerName;
  const canPickQuestions = hasPlayerName && !!difficultyMode;
  const hasAvailableQuestions = normalizedQuestions.length > 0;
  const isSelectionComplete = hasPlayerName && !!selectedDifficultyOption && !!selectedQuestionSet && hasAvailableQuestions;
  const isStartDisabled = isQuestionBankLoading || !isSelectionComplete;
  const stepGridColumns = isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))';
  const selectedDifficultyColor = selectedDifficultyOption?.color || '#94a3b8';
  const selectedSetColor = selectedQuestionSet ? getQuestionSetChipColor(questionSet) : '#94a3b8';
  const isJapanese = t.questionsSuffix === '問';
  const questionSetSeparator = t.questionsSuffix === '問' ? '' : ' ';

  useEffect(() => {
    if (hasPlayerName && showNameWarning) {
      setShowNameWarning(false);
    }
  }, [hasPlayerName, showNameWarning]);

  const handleStart = () => {
    if (!hasPlayerName) {
      setShowNameWarning(true);
      nameInputRef.current?.focus?.();
      triggerHaptic('warning');
      return;
    }

    if (isStartDisabled) return;

    triggerHaptic('success');
    startQuiz();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minHeight: 0, paddingBottom: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: stepGridColumns, gap: '16px', alignItems: 'stretch' }}>
        <StepCard
          isMobile={isMobile}
          title={toUiLabelCase(t.nameLabel)}
          description={t.namePlaceholder}
          stepLabel={`${toUiLabelCase(t.step)} 1`}
          icon={UserRound}
          background="#eef6ff"
          border="#93c5fd"
          bottom="#3b82f6"
          locked={false}
        >
          <div style={{ display: 'grid', gap: '10px' }}>
            <input
              ref={nameInputRef}
              value={playerName}
              onChange={(event) => {
                setPlayerName(event.target.value);
                if (showNameWarning) setShowNameWarning(false);
              }}
              placeholder={toUiLabelCase(t.namePlaceholder)}
              maxLength={24}
              style={{
                width: '100%',
                border: `2.5px solid ${showNameWarning ? '#fca5a5' : '#bfdbfe'}`,
                borderBottom: `4px solid ${showNameWarning ? '#ef4444' : '#60a5fa'}`,
                borderRadius: '22px',
                background: '#ffffff',
                padding: isMobile ? '10px 12px' : '12px 14px',
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: isMobile ? '1.12rem' : '1.2rem',
                lineHeight: 1.2,
                fontWeight: '400',
                color: '#1e3a8a',
                outline: 'none',
                boxShadow: 'inset 0 4px 12px rgba(148, 163, 184, 0.08)',
              }}
            />
            {showNameWarning && (
            <p style={{ margin: 0, color: '#b91c1c', fontFamily: 'var(--font-main)', fontSize: '0.92rem', lineHeight: 1.4 }}>
                {t.nameRequired}
              </p>
            )}
          </div>
        </StepCard>

        <StepCard
          isMobile={isMobile}
          title={toUiLabelCase(t.setupDifficultyTitle)}
          description={null}
          stepLabel={`${toUiLabelCase(t.step)} 2`}
          icon={Gauge}
          background="#f5f3ff"
          border="#c4b5fd"
          bottom="#8b5cf6"
          locked={!canPickDifficulty}
          lockedLabel={t.nameFirst || 'Name first'}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px',
              pointerEvents: canPickDifficulty ? 'auto' : 'none',
            }}
          >
            {DIFFICULTY_MODE_OPTIONS.map((option) => {
              const isSelected = difficultyMode === option.key;

              return (
                <motion.button
                  key={option.key}
                  whileHover={canPickDifficulty ? { y: -1.5, scale: 1.01 } : undefined}
                  whileTap={canPickDifficulty ? { scale: 0.98 } : undefined}
                  onClick={() => {
                    triggerHaptic('selection');
                    setDifficultyMode(option.key);
                  }}
                  className="sketchbook-border paper-interact"
                  style={{
                    background: '#ffffff',
                    border: `2.5px solid ${option.color}55`,
                    borderBottom: `5px solid ${option.color}`,
                    borderRadius: '16px',
                    padding: '8px 12px',
                    display: 'grid',
                    gap: '4px',
                    textAlign: 'left',
                    cursor: canPickDifficulty ? 'pointer' : 'not-allowed',
                    boxShadow: isSelected ? `0 12px 20px ${option.color}22` : `0 8px 18px rgba(148, 163, 184, 0.08)`,
                    opacity: canPickDifficulty ? 1 : 0.62,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: option.color, fontSize: '1.08rem', lineHeight: 1.1, fontWeight: '400' }}>
                        {toUiLabelCase(getDifficultyLabel(option.key, t))}
                      </span>
                      <span style={{ fontFamily: 'var(--font-main)', color: '#64748b', fontSize: '0.82rem', lineHeight: 1 }}>
                        {getDifficultyTimerLabel(option.key, isJapanese ? 'ja' : 'en')}
                      </span>
                    </div>
                    {isSelected && <CircleDot size={18} strokeWidth={2.6} color={option.color} />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </StepCard>

        <StepCard
          isMobile={isMobile}
          title={toUiLabelCase(t.setupSetTitle)}
          description={null}
          stepLabel={`${toUiLabelCase(t.step)} 3`}
          icon={Rows3}
          background="#f0fdf4"
          border="#86efac"
          bottom="#22c55e"
          locked={!canPickQuestions}
          lockedLabel={canPickDifficulty ? t.difficultyFirst : (t.nameFirst || 'Name first')}
        >
          {canPickQuestions ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                pointerEvents: 'auto',
                flex: 1,
                alignContent: 'start',
              }}
            >
              {availableQuestionSetOptions.map((option) => {
                const isSelected = questionSet === option.key;
                const accent = getQuestionSetChipColor(option.key);

                return (
                <motion.button
                  key={option.key}
                  whileHover={{ y: -1.5, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerHaptic('selection');
                      setQuestionSet(option.key);
                    }}
                  className="sketchbook-border paper-interact"
                  style={{
                    background: '#ffffff',
                    border: `2.5px solid ${accent}55`,
                    borderBottom: `5px solid ${accent}`,
                    borderRadius: '16px',
                    padding: '8px 12px',
                    display: 'grid',
                    gap: '4px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 12px 20px ${accent}22` : `0 8px 18px rgba(148, 163, 184, 0.08)`,
                  }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: accent, fontSize: '1.35rem', lineHeight: 1, fontWeight: '400' }}>
                        {option.label}
                      </span>
                      {isSelected && <CircleDot size={18} strokeWidth={2.6} color={accent} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                minHeight: 'auto',
                borderRadius: '20px',
                border: '2.5px solid rgba(148, 163, 184, 0.2)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(240,253,244,0.72))',
                display: 'grid',
                gap: '8px',
                alignContent: 'start',
                padding: '10px',
                color: '#64748b',
                fontFamily: 'var(--font-main)',
                fontSize: '0.96rem',
                lineHeight: 1.5,
                flex: 1,
              }}
            >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', color: '#64748b' }}>
                <Lock size={18} strokeWidth={2.4} />
                <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: '1rem', lineHeight: 1 }}>
                  {t.difficultyFirst}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
                  gap: '10px',
                  opacity: 0.68,
                }}
              >
                {QUESTION_SET_PREVIEW_COUNTS.map((count) => {
                  const accent = getQuestionSetChipColor(count);

                  return (
                    <div
                      key={count}
                      style={{
                        background: '#ffffff',
                        border: `2.5px solid ${accent}33`,
                        borderBottom: `5px solid ${accent}`,
                        borderRadius: '20px',
                        padding: '12px 14px',
                        minHeight: '68px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: `0 8px 18px ${accent}10`,
                      }}
                    >
                      <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: accent, fontSize: '1.28rem', lineHeight: 1 }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </StepCard>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...PANEL_TRANSITION, delay: 0.24 }}
        className="sketchbook-border"
        style={{
          ...panelStyle('#fff1f2', '#fda4af', '#ef4444'),
          padding: isMobile ? '10px 12px' : '10px 16px',
          borderRadius: '20px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
          gap: '10px',
          alignItems: 'center',
        }}
      >
          <div style={{ display: 'grid', gap: '10px' }}>
            <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#9f1239', fontSize: '1rem', lineHeight: 1 }}>
              {t.reviewBeforeStarting || 'Review before starting'}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <span
              className="sketchbook-border"
              style={{
                background: '#ffffff',
                border: `2px solid ${hasPlayerName ? '#fda4af' : '#fecdd3'}`,
                borderBottom: `4px solid ${hasPlayerName ? '#ef4444' : '#fda4af'}`,
                borderRadius: '999px',
                padding: '8px 12px',
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: '0.94rem',
                lineHeight: 1,
                color: hasPlayerName ? '#b91c1c' : '#ef4444',
                fontWeight: '400',
              }}
            >
              {hasPlayerName ? playerName.trim() : t.namePlaceholder}
            </span>
            <span
              className="sketchbook-border"
              style={{
                background: '#ffffff',
                border: `2px solid ${selectedDifficultyColor}55`,
                borderBottom: `4px solid ${selectedDifficultyColor}`,
                borderRadius: '999px',
                padding: '8px 12px',
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: '0.94rem',
                lineHeight: 1,
                color: selectedDifficultyColor,
                fontWeight: '400',
              }}
            >
              {selectedDifficultyOption ? (
                <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '8px' }}>
                  <span>{toUiLabelCase(getDifficultyLabel(selectedDifficultyOption.key, t))}</span>
                  <span style={{ fontFamily: 'var(--font-main)', fontSize: '0.8rem', lineHeight: 1, color: '#64748b' }}>
                    {getDifficultyTimerLabel(selectedDifficultyOption.key, isJapanese ? 'ja' : 'en')}
                  </span>
                </span>
              ) : (
                t.setupDifficultyTitle
              )}
            </span>
            <span
              className="sketchbook-border"
              style={{
                background: '#ffffff',
                border: `2px solid ${selectedSetColor}55`,
                borderBottom: `4px solid ${selectedSetColor}`,
                borderRadius: '999px',
                padding: '8px 12px',
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: '0.94rem',
                lineHeight: 1,
                color: selectedSetColor,
                fontWeight: '400',
              }}
            >
              <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: selectedSetColor }}>
                {selectedQuestionSet ? `${selectedQuestionSet.label}${questionSetSeparator}${t.questionsSuffix || 'questions'}` : t.setupSetTitle}
              </span>
            </span>
          </div>
        </div>

        <motion.button
          whileHover={isStartDisabled ? undefined : { scale: 1.015, y: -1.5 }}
          whileTap={isStartDisabled ? undefined : { scale: 0.98 }}
          onClick={handleStart}
          disabled={isStartDisabled}
          className="sketchbook-border paper-interact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minWidth: isMobile ? '100%' : '240px',
            border: '2.5px solid #7f1d1d',
            borderBottom: '6px solid #450a0a',
            borderRadius: '16px',
            padding: isMobile ? '10px 14px' : '12px 18px',
            background: isStartDisabled ? '#fca5a5' : '#ef4444',
            color: '#ffffff',
            fontFamily: 'Sniglet, var(--font-main)',
            fontWeight: '400',
            fontSize: isMobile ? '1.14rem' : '1.2rem',
            lineHeight: 1,
            cursor: isStartDisabled ? 'not-allowed' : 'pointer',
            opacity: isStartDisabled ? 0.68 : 1,
            boxShadow: isStartDisabled ? 'none' : '0 14px 28px rgba(239, 68, 68, 0.28)',
          }}
        >
          <Play size={isMobile ? 22 : 24} strokeWidth={2.8} fill="#ffffff" />
          {toUiLabelCase(t.start || 'Start')}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default QuestionsSetupSection;
