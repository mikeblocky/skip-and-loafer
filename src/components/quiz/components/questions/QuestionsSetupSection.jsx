import { motion } from 'framer-motion';
import { Play, CheckCircle2 } from 'lucide-react';
import { ListRow } from '../../../sync/syncSharedComponents';
import { DIFFICULTY_MODE_OPTIONS } from '../../quizConstants';
import { getDifficultyChipLabel, getQuestionSetChipColor } from '../../quizUtils';
import SetupOptionCard from './SetupOptionCard';

const smashVariant = {
  hidden: { y: -80, scale: 0.8, opacity: 0, rotate: -3 },
  visible: { 
    y: 0, 
    scale: 1, 
    opacity: 1, 
    rotate: 0, 
    transition: { type: 'spring', stiffness: 500, damping: 10, mass: 1 } 
  }
};

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
  <div style={{ display: 'grid', gap: '16px', paddingBottom: '32px' }}>
    {/* Header row smashing in */}
    <motion.div 
      initial={{ scale: 0, rotate: 10, y: -50 }} 
      animate={{ scale: 1, rotate: 0, y: 0 }} 
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
    >
      <ListRow
        index={0}
        noteColor={0}
        title={t.setupTitle}
        numberLine1="QUIZ"
        numberLine2="GO"
        isMobile={isMobile}
        subtitle={<span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#4b5563', fontWeight: 'bold' }}>{availableQuestionCount || normalizedQuestions.length} questions available</span>}
      />
    </motion.div>

    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={{ visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } }} 
      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      {/* Step 1: Name */}
      <motion.div variants={smashVariant} whileHover={{ scale: 1.02, rotate: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
        <ListRow
          index={1}
          noteColor={1}
          numberLine1="STEP"
          numberLine2="1"
          isMobile={isMobile}
          title={<span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1f2937', fontSize: '1.05rem' }}>{t.nameLabel}</span>}
          subtitle={
            <div style={{ marginTop: '12px', width: '100%', maxWidth: '300px', position: 'relative' }}>
              <input
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder={t.namePlaceholder}
                maxLength={24}
                style={{ 
                  border: '3px solid #cbd5e1', 
                  borderBottom: '6px solid #94a3b8',
                  borderRadius: '16px', 
                  padding: isMobile ? '12px 16px' : '14px 20px', 
                  fontFamily: 'var(--font-main)', 
                  fontSize: '1.1rem', 
                  fontWeight: '900', 
                  outline: 'none', 
                  color: '#1e293b', 
                  background: '#fff', 
                  width: '100%', 
                  boxSizing: 'border-box',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                onFocus={(e) => { 
                  e.target.style.borderColor = '#fbbf24'; 
                  e.target.style.borderBottomColor = '#d97706';
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                }}
                onBlur={(e) => { 
                  e.target.style.borderColor = '#cbd5e1'; 
                  e.target.style.borderBottomColor = '#94a3b8';
                  e.target.style.transform = 'translateY(0) scale(1)';
                }}
              />
            </div>
          }
          rightContent={
            playerName.length > 0 && <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: [1.4, 1.1, 1], rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 8 }}><CheckCircle2 color="#10b981" size={isMobile ? 26 : 32} strokeWidth={4} /></motion.div>
          }
        />
      </motion.div>

      {/* Step 2: Question Set */}
      <motion.div variants={smashVariant} whileHover={{ scale: 1.02, rotate: -1 }} transition={{ type: 'spring', stiffness: 300 }}>
        <ListRow
          index={2}
          noteColor={2}
          numberLine1="STEP"
          numberLine2="2"
          isMobile={isMobile}
          title={<span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1f2937', fontSize: '1.05rem' }}>{t.setupSetTitle}</span>}
          subtitle={
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {availableQuestionSetOptions.map((option) => {
                const isSelected = questionSet === option.key;
                return (
                  <div key={option.key} style={{ minWidth: '90px', flex: 1 }}>
                    <SetupOptionCard
                      label={option.label}
                      selected={isSelected}
                      color={getQuestionSetChipColor(option.key)}
                      title={`${option.label} Questions`}
                      isMobile={isMobile}
                      onClick={() => setQuestionSet(option.key)}
                    />
                  </div>
                );
              })}
            </div>
          }
          rightContent={
            questionSet && <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: [1.4, 1.1, 1], rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 8 }}><CheckCircle2 color="#10b981" size={isMobile ? 26 : 32} strokeWidth={4} /></motion.div>
          }
        />
      </motion.div>

      {/* Step 3: Difficulty */}
      <motion.div variants={smashVariant} whileHover={{ scale: 1.02, rotate: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
        <ListRow
          index={3}
          noteColor={3}
          numberLine1="STEP"
          numberLine2="3"
          isMobile={isMobile}
          title={<span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1f2937', fontSize: '1.05rem' }}>{t.setupDifficultyTitle}</span>}
          subtitle={
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {DIFFICULTY_MODE_OPTIONS.map((option) => {
                const isSelected = difficultyMode === option.key;
                return (
                  <div key={option.key} style={{ minWidth: '90px', flex: isMobile ? '1 1 30%' : 1 }}>
                    <SetupOptionCard
                      label={getDifficultyChipLabel(option.key)}
                      selected={isSelected}
                      color={option.color}
                      title={option.label}
                      isMobile={isMobile}
                      onClick={() => setDifficultyMode(option.key)}
                    />
                  </div>
                );
              })}
            </div>
          }
          rightContent={
            difficultyMode && <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: [1.4, 1.1, 1], rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 8 }}><CheckCircle2 color="#10b981" size={isMobile ? 26 : 32} strokeWidth={4} /></motion.div>
          }
        />
      </motion.div>

      {/* Start Button Smashing */}
      <motion.button
        variants={smashVariant}
        whileHover={{ scale: 1.05, rotate: -2, y: -4 }}
        whileTap={{ scale: 0.8, rotate: 3, y: 12 }}
        onClick={startQuiz}
        disabled={isQuestionBankLoading || normalizedQuestions.length === 0}
        style={{
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          border: '4px solid #b91c1c',
          borderBottom: '10px solid #991b1b',
          borderRadius: '24px',
          padding: isMobile ? '18px' : '22px',
          background: '#ef4444',
          color: '#fff',
          fontFamily: 'var(--font-main)',
          fontWeight: '900',
          fontSize: isMobile ? '1.3rem' : '1.5rem',
          letterSpacing: '0.5px',
          cursor: isQuestionBankLoading || normalizedQuestions.length === 0 ? 'not-allowed' : 'pointer',
          opacity: isQuestionBankLoading || normalizedQuestions.length === 0 ? 0.6 : 1,
          marginTop: '24px',
          filter: isQuestionBankLoading || normalizedQuestions.length === 0 ? 'grayscale(0.8)' : 'none',
          boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)',
          transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <Play size={isMobile ? 26 : 30} strokeWidth={4} fill="#fff" />
        <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {isQuestionBankLoading ? 'Loading...' : t.start}
        </span>
      </motion.button>
    </motion.div>
  </div>
);

export default QuestionsSetupSection;
