import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';
import { TAP_SCALE_DEFAULT } from '../../../shared/animationPresets';
import { DIFFICULTY_OPTIONS } from '../../quizConstants';
import ChoiceChapterCard from './ChoiceChapterCard';

const QuestionsPlayingSection = ({
  isMobile,
  t,
  currentQuestion,
  currentIndex,
  questions,
  score,
  timeLeft,
  setShowMenuConfirm,
  showMenuConfirm,
  resetQuiz,
  orderingHintLines,
  selectedChoice,
  handleChoiceSelect,
  feedback,
}) => (
  <div style={{ display: 'grid', gap: '10px', paddingBottom: isMobile ? '92px' : 0 }}>
    <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: isMobile ? '10px 12px' : '12px 14px', display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#6b7280', fontSize: isMobile ? '0.78rem' : '0.9rem' }}>{t.question}: {currentIndex + 1}/{questions.length}</span>
      <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#6b7280', fontSize: isMobile ? '0.78rem' : '0.9rem' }}>{t.score}: {score}</span>
      <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#6b7280', fontSize: isMobile ? '0.78rem' : '0.9rem' }}>{t.difficulty}: {DIFFICULTY_OPTIONS.find((option) => option.key === currentQuestion.difficulty)?.label || '—'}</span>
      <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#ef4444', fontSize: isMobile ? '0.78rem' : '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Timer size={isMobile ? 12 : 14} /> {t.timeLeft}: {timeLeft}s</span>
      <motion.button
        whileTap={TAP_SCALE_DEFAULT}
        onClick={() => setShowMenuConfirm(true)}
        style={{ border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', borderRadius: '9999px', padding: isMobile ? '4px 8px' : '6px 10px', fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: isMobile ? '0.7rem' : '0.78rem', cursor: 'pointer' }}
      >
        {t.returnMenu}
      </motion.button>
    </div>

    {showMenuConfirm && (
      <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px', borderLeft: '4px solid #ef4444', padding: isMobile ? '10px 12px' : '11px 14px', display: 'grid', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#374151', fontSize: isMobile ? '0.82rem' : '0.9rem' }}>{t.returnMenuConfirmTitle}</span>
        <span style={{ fontFamily: 'var(--font-hand)', color: '#6b7280', fontSize: isMobile ? '0.72rem' : '0.8rem' }}>{t.returnMenuConfirmBody}</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <motion.button
            whileTap={TAP_SCALE_DEFAULT}
            onClick={() => setShowMenuConfirm(false)}
            style={{ border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', borderRadius: '9999px', padding: isMobile ? '5px 10px' : '6px 12px', fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: isMobile ? '0.72rem' : '0.8rem', cursor: 'pointer' }}
          >
            {t.stayQuiz}
          </motion.button>
          <motion.button
            whileTap={TAP_SCALE_DEFAULT}
            onClick={resetQuiz}
            style={{ border: 'none', background: '#ef4444', color: '#fff', borderRadius: '9999px', padding: isMobile ? '5px 10px' : '6px 12px', fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: isMobile ? '0.72rem' : '0.8rem', cursor: 'pointer' }}
          >
            {t.leaveQuiz}
          </motion.button>
        </div>
      </div>
    )}

    <div
      style={{
        background: '#fffbeb',
        border: '2px solid #fde68a',
        borderBottom: '4px solid #f59e0b',
        borderRadius: '10px',
        padding: isMobile ? '14px 12px' : '16px 16px',
        display: 'grid',
        gap: '8px',
      }}
    >
      <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#b45309', fontSize: isMobile ? '0.7rem' : '0.78rem' }}>QUESTION</span>
      <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#374151', fontSize: isMobile ? '0.95rem' : '1.05rem', lineHeight: 1.4 }}>{currentQuestion.prompt}</span>
    </div>

    {orderingHintLines.length > 0 && (
      <div
        style={{
          background: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          borderRadius: '10px',
          padding: isMobile ? '10px 10px' : '11px 12px',
          display: 'grid',
          gap: '4px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#475569', fontSize: isMobile ? '0.7rem' : '0.78rem' }}>EVENT LIST</span>
        {orderingHintLines.map((line) => (
          <span key={line} style={{ fontFamily: 'var(--font-hand)', color: '#334155', fontSize: isMobile ? '0.8rem' : '0.88rem', lineHeight: 1.3 }}>{line}</span>
        ))}
      </div>
    )}

    {currentQuestion.choices.map((choice, index) => {
      const isLocked = selectedChoice !== null || timeLeft <= 0;
      const isSelected = selectedChoice === index;
      const isCorrectAnswer = currentQuestion.answer === index;
      const showCorrect = isLocked && isCorrectAnswer;
      const showWrong = isLocked && isSelected && !isCorrectAnswer;

      return (
        <ChoiceChapterCard
          key={`${currentQuestion.id}-${index}-${choice}`}
          index={index}
          text={choice}
          isMobile={isMobile}
          isLocked={isLocked}
          isCorrect={showCorrect}
          isWrong={showWrong}
          isDimmed={isLocked && !showCorrect && !showWrong && isSelected === false}
          feedbackText={showCorrect ? t.correct : showWrong ? t.wrong : ''}
          onClick={() => handleChoiceSelect(index)}
        />
      );
    })}

    {feedback && (
      <div style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: feedback === t.correct ? '#059669' : '#dc2626', fontSize: isMobile ? '0.85rem' : '0.95rem', padding: '2px 2px 0 2px' }}>
        {feedback} • {t.nextUp}
      </div>
    )}
  </div>
);

export default QuestionsPlayingSection;
