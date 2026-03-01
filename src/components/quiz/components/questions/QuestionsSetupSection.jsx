import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { ListRow } from '../../../sync/syncSharedComponents';
import { TAP_SCALE_DEFAULT } from '../../../shared/animationPresets';
import { DIFFICULTY_MODE_OPTIONS } from '../../quizConstants';
import { getDifficultyChipLabel, getQuestionSetChipColor } from '../../quizUtils';
import SetupOptionCard from './SetupOptionCard';

const QuestionsSetupSection = ({
  isMobile,
  t,
  normalizedQuestions,
  availableQuestionCount,
  availableQuestionSetOptions,
  playerName,
  setPlayerName,
  questionSet,
  setQuestionSet,
  difficultyMode,
  setDifficultyMode,
  startQuiz,
  isQuestionBankLoading,
}) => (
  <div style={{ display: 'grid', gap: '12px' }}>
    <ListRow
      index={0}
      noteColor={0}
      title={t.setupTitle}
      numberLine1="QUIZ"
      numberLine2="GO"
      isMobile={isMobile}
      subtitle={<span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.75rem' : '0.85rem', color: '#6b7280' }}>{availableQuestionCount || normalizedQuestions.length} questions available</span>}
    />

    <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: isMobile ? '12px' : '14px', display: 'grid', gap: '10px' }}>
      <label style={{ display: 'grid', gap: '6px' }}>
        <span style={{ fontFamily: 'var(--font-hand)', color: '#6b7280', fontWeight: 'bold', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{t.nameLabel}</span>
        <input
          value={playerName}
          onChange={(event) => setPlayerName(event.target.value)}
          placeholder={t.namePlaceholder}
          maxLength={24}
          style={{ border: '1.5px solid #d1d5db', borderRadius: '8px', padding: isMobile ? '8px 10px' : '9px 12px', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.9rem' : '1rem', outline: 'none', color: '#374151' }}
        />
      </label>

      <div style={{ display: 'grid', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-hand)', color: '#6b7280', fontWeight: 'bold', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{t.setupSetTitle}</span>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4, minmax(0, 1fr))' : 'repeat(6, minmax(0, 1fr))', gap: isMobile ? '4px' : '6px' }}>
          {availableQuestionSetOptions.map((option) => {
            const isSelected = questionSet === option.key;
            return (
              <SetupOptionCard
                key={option.key}
                label={option.label}
                selected={isSelected}
                color={getQuestionSetChipColor(option.key)}
                title={`${option.label} Questions`}
                isMobile={isMobile}
                onClick={() => setQuestionSet(option.key)}
              />
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-hand)', color: '#6b7280', fontWeight: 'bold', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{t.setupDifficultyTitle}</span>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))', gap: isMobile ? '4px' : '6px' }}>
          {DIFFICULTY_MODE_OPTIONS.map((option) => {
            const isSelected = difficultyMode === option.key;
            return (
              <SetupOptionCard
                key={option.key}
                label={getDifficultyChipLabel(option.key)}
                selected={isSelected}
                color={option.color}
                title={option.label}
                isMobile={isMobile}
                onClick={() => setDifficultyMode(option.key)}
              />
            );
          })}
        </div>
      </div>

      <motion.button
        whileTap={TAP_SCALE_DEFAULT}
        onClick={startQuiz}
        disabled={isQuestionBankLoading || normalizedQuestions.length === 0}
        style={{
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          border: '1.5px solid #dc2626',
          borderBottom: '4px solid #b91c1c',
          borderRadius: '10px',
          padding: isMobile ? '11px 12px' : '12px 14px',
          background: '#fee2e2',
          color: '#b91c1c',
          fontFamily: 'var(--font-hand)',
          fontWeight: 'bold',
          fontSize: isMobile ? '0.9rem' : '1rem',
          cursor: isQuestionBankLoading || normalizedQuestions.length === 0 ? 'not-allowed' : 'pointer',
          opacity: isQuestionBankLoading || normalizedQuestions.length === 0 ? 0.65 : 1,
          boxShadow: '0 2px 8px rgba(239,68,68,0.22)',
        }}
      >
        <Play size={isMobile ? 14 : 16} />
        {isQuestionBankLoading ? 'Loading questions...' : t.start}
      </motion.button>
    </div>
  </div>
);

export default QuestionsSetupSection;
