import { motion } from 'framer-motion';
import { NotebookText, UserRound, Rows3, Gauge, Play, CircleDot } from 'lucide-react';
import { DIFFICULTY_MODE_OPTIONS } from '../../quizConstants';
import { getDifficultyChipLabel, getQuestionSetChipColor } from '../../quizUtils';
import { triggerHaptic } from '../../../../utils/haptics';
import { toUiLabelCase } from '../../../../utils/textCase';

const PANEL_TRANSITION = { type: 'spring', stiffness: 320, damping: 20 };

const panelStyle = (background, border, bottom) => ({
  background,
  border: `3.5px solid ${border}`,
  borderBottom: `10px solid ${bottom}`,
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
  const selectedDifficulty = DIFFICULTY_MODE_OPTIONS.find((option) => option.key === difficultyMode) || DIFFICULTY_MODE_OPTIONS[0];
  const selectedQuestionSet = availableQuestionSetOptions.find((option) => option.key === questionSet) || availableQuestionSetOptions[0];
  const isStartDisabled = isQuestionBankLoading || normalizedQuestions.length === 0;
  const summaryName = playerName.trim() || t.namePlaceholder;

  return (
    <div style={{ display: 'grid', gap: '20px', paddingBottom: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.15fr) minmax(280px, 0.85fr)', gap: '18px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -1.4 }}
          animate={{ opacity: 1, y: 0, rotate: -0.6 }}
          transition={PANEL_TRANSITION}
          className="sketchbook-border"
          style={{
            ...panelStyle('#fff7e7', '#fbbf24', '#f59e0b'),
            padding: isMobile ? '22px 20px' : '26px 26px 24px',
            display: 'grid',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span style={sectionTitleStyle}>
              <NotebookText size={18} strokeWidth={2.4} />
              {toUiLabelCase(t.setupTitle)}
            </span>
            <span
              style={{
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: '0.92rem',
                lineHeight: 1,
                color: '#92400e',
                background: '#ffffff',
                border: '2.5px solid #f59e0b',
                borderBottom: '6px solid #d97706',
                borderRadius: '999px',
                padding: '8px 12px',
                fontWeight: '400',
              }}
            >
              {availableQuestionCount || normalizedQuestions.length} {toUiLabelCase(t.questionsTab)}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <h2
              style={{
                margin: 0,
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: isMobile ? '1.8rem' : '2.15rem',
                lineHeight: 1.08,
                fontWeight: '400',
                color: '#7c2d12',
              }}
            >
              {toUiLabelCase(t.setupTitle)}
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-main)',
                color: '#7c5f3a',
                fontSize: isMobile ? '0.98rem' : '1.02rem',
                lineHeight: 1.5,
                maxWidth: isMobile ? '100%' : '40ch',
              }}
            >
              {toUiLabelCase(t.setupSetTitle)}. {toUiLabelCase(t.setupDifficultyTitle)}.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
            <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px solid #fed7aa', borderBottom: '7px solid #fb923c', borderRadius: '20px', padding: '14px 16px', display: 'grid', gap: '6px' }}>
              <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, color: '#c2410c', fontWeight: '400' }}>
                {toUiLabelCase(t.question)}
              </span>
              <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? '1.5rem' : '1.7rem', lineHeight: 1, color: '#7c2d12', fontWeight: '400' }}>
                {selectedQuestionSet?.label || questionSet}
              </span>
            </div>
            <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px solid #c4b5fd', borderBottom: '7px solid #8b5cf6', borderRadius: '20px', padding: '14px 16px', display: 'grid', gap: '6px' }}>
              <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, color: '#6d28d9', fontWeight: '400' }}>
                {toUiLabelCase(t.difficulty)}
              </span>
              <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? '1.3rem' : '1.55rem', lineHeight: 1.05, color: '#4c1d95', fontWeight: '400' }}>
                {toUiLabelCase(getDifficultyChipLabel(selectedDifficulty.key))}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, rotate: 1.2 }}
          animate={{ opacity: 1, y: 0, rotate: 0.5 }}
          transition={{ ...PANEL_TRANSITION, delay: 0.06 }}
          className="sketchbook-border"
          style={{
            ...panelStyle('#eef6ff', '#93c5fd', '#3b82f6'),
            padding: isMobile ? '20px' : '24px',
            display: 'grid',
            gap: '16px',
            alignContent: 'start',
          }}
        >
          <span style={sectionTitleStyle}>
            <UserRound size={18} strokeWidth={2.4} />
            {toUiLabelCase(t.nameLabel)}
          </span>

          <div style={{ display: 'grid', gap: '10px' }}>
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder={toUiLabelCase(t.namePlaceholder)}
              maxLength={24}
              style={{
                width: '100%',
                border: '3.5px solid #bfdbfe',
                borderBottom: '8px solid #60a5fa',
                borderRadius: '22px',
                background: '#ffffff',
                padding: isMobile ? '16px 18px' : '18px 20px',
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: isMobile ? '1.12rem' : '1.2rem',
                lineHeight: 1.2,
                fontWeight: '400',
                color: '#1e3a8a',
                outline: 'none',
                boxShadow: 'inset 0 4px 12px rgba(148, 163, 184, 0.08)',
              }}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26, rotate: -0.8 }}
        animate={{ opacity: 1, y: 0, rotate: -0.2 }}
        transition={{ ...PANEL_TRANSITION, delay: 0.12 }}
        className="sketchbook-border"
        style={{
          ...panelStyle('#f0fdf4', '#86efac', '#22c55e'),
          padding: isMobile ? '20px' : '24px',
          display: 'grid',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={sectionTitleStyle}>
            <Rows3 size={18} strokeWidth={2.4} />
            {toUiLabelCase(t.setupSetTitle)}
          </span>
          <span style={{ fontFamily: 'var(--font-main)', color: '#166534', fontSize: '0.92rem', fontWeight: '700' }}>
            {availableQuestionSetOptions.length}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
          {availableQuestionSetOptions.map((option) => {
            const isSelected = questionSet === option.key;
            const accent = getQuestionSetChipColor(option.key);

            return (
              <motion.button
                key={option.key}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.96, y: 4 }}
                onClick={() => {
                  triggerHaptic('selection');
                  setQuestionSet(option.key);
                }}
                className="sketchbook-border paper-interact"
                style={{
                  background: isSelected ? `${accent}18` : '#ffffff',
                  border: `3.5px solid ${isSelected ? accent : '#d7e0ec'}`,
                  borderBottom: `8px solid ${isSelected ? accent : '#b9c8d8'}`,
                  borderRadius: '22px',
                  padding: '14px 14px 12px',
                  display: 'grid',
                  gap: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: isSelected ? `0 12px 20px ${accent}22` : '0 8px 18px rgba(148, 163, 184, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: accent, fontSize: '1.35rem', lineHeight: 1, fontWeight: '400' }}>
                    {option.label}
                  </span>
                  {isSelected && <CircleDot size={18} strokeWidth={2.6} color={accent} />}
                </div>
                <span style={{ fontFamily: 'var(--font-main)', color: isSelected ? '#1f2937' : '#64748b', fontSize: '0.9rem', lineHeight: 1.3, fontWeight: '700' }}>
                  {toUiLabelCase(t.questionsTab)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 26, rotate: 0.8 }}
        animate={{ opacity: 1, y: 0, rotate: 0.2 }}
        transition={{ ...PANEL_TRANSITION, delay: 0.18 }}
        className="sketchbook-border"
        style={{
          ...panelStyle('#f5f3ff', '#c4b5fd', '#8b5cf6'),
          padding: isMobile ? '20px' : '24px',
          display: 'grid',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={sectionTitleStyle}>
            <Gauge size={18} strokeWidth={2.4} />
            {toUiLabelCase(t.setupDifficultyTitle)}
          </span>
          <span style={{ fontFamily: 'var(--font-main)', color: '#6d28d9', fontSize: '0.92rem', fontWeight: '700' }}>
            {toUiLabelCase(t.timeLeft)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {DIFFICULTY_MODE_OPTIONS.map((option) => {
            const isSelected = difficultyMode === option.key;
            const timerLabel = option.key === 'hard' || option.key === 'really-hard' ? '45s' : '30s';

            return (
              <motion.button
                key={option.key}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.96, y: 4 }}
                onClick={() => {
                  triggerHaptic('selection');
                  setDifficultyMode(option.key);
                }}
                className="sketchbook-border paper-interact"
                style={{
                  background: isSelected ? `${option.color}18` : '#ffffff',
                  border: `3.5px solid ${isSelected ? option.color : '#ddd6fe'}`,
                  borderBottom: `8px solid ${isSelected ? option.color : '#c4b5fd'}`,
                  borderRadius: '22px',
                  padding: '14px',
                  display: 'grid',
                  gap: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: isSelected ? `0 12px 20px ${option.color}22` : '0 8px 18px rgba(139, 92, 246, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: isSelected ? option.color : '#0f172a', fontSize: '1.08rem', lineHeight: 1.1, fontWeight: '400' }}>
                    {toUiLabelCase(getDifficultyChipLabel(option.key))}
                  </span>
                  {isSelected && <CircleDot size={18} strokeWidth={2.6} color={option.color} />}
                </div>
                <span style={{ fontFamily: 'var(--font-main)', color: '#64748b', fontSize: '0.88rem', lineHeight: 1.25, fontWeight: '700' }}>
                  {timerLabel}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...PANEL_TRANSITION, delay: 0.24 }}
        className="sketchbook-border"
        style={{
          ...panelStyle('#fff1f2', '#fda4af', '#ef4444'),
          padding: isMobile ? '18px' : '20px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[
            summaryName,
            `${selectedQuestionSet?.label || questionSet} ${toUiLabelCase(t.questionsTab)}`,
            toUiLabelCase(getDifficultyChipLabel(selectedDifficulty.key)),
          ].map((item) => (
            <span
              key={item}
              className="sketchbook-border"
              style={{
                background: '#ffffff',
                border: '2.5px solid #fecdd3',
                borderBottom: '6px solid #fda4af',
                borderRadius: '999px',
                padding: '8px 12px',
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: '0.94rem',
                lineHeight: 1,
                color: '#9f1239',
                fontWeight: '400',
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.94, y: 6 }}
          onClick={() => {
            triggerHaptic('success');
            startQuiz();
          }}
          disabled={isStartDisabled}
          className="sketchbook-border paper-interact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minWidth: isMobile ? '100%' : '240px',
            border: '4px solid #7f1d1d',
            borderBottom: '10px solid #450a0a',
            borderRadius: '24px',
            padding: isMobile ? '16px 18px' : '18px 22px',
            background: isStartDisabled ? '#fca5a5' : '#ef4444',
            color: '#ffffff',
            fontFamily: 'Sniglet, var(--font-main)',
            fontWeight: '400',
            fontSize: isMobile ? '1.24rem' : '1.34rem',
            lineHeight: 1,
            cursor: isStartDisabled ? 'not-allowed' : 'pointer',
            opacity: isStartDisabled ? 0.68 : 1,
            boxShadow: isStartDisabled ? 'none' : '0 14px 28px rgba(239, 68, 68, 0.28)',
          }}
        >
          <Play size={isMobile ? 22 : 24} strokeWidth={2.8} fill="#ffffff" />
          {isQuestionBankLoading ? `${toUiLabelCase(t.start || 'Start')}...` : toUiLabelCase(t.start || 'Start')}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default QuestionsSetupSection;
