import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from 'lucide-react';
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
  <div style={{ display: 'grid', gap: '20px', paddingBottom: isMobile ? '104px' : '40px' }}>
    {/* Floating Header Actions - Smashed in */}
    <motion.div 
      initial={{ y: -30, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
      
      {/* Stats Cluster */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ background: '#fff', border: '3px solid #1f2937', borderBottom: '6px solid #1f2937', borderRadius: '16px', padding: '8px 16px', display: 'flex', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1f2937', fontSize: isMobile ? '0.85rem' : '1rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.8em' }}>Progress </span> 
            <span style={{ color: '#ef4444' }}>{currentIndex + 1}</span>/{questions.length}
          </span>
          <div style={{ width: '2px', background: '#e2e8f0', borderRadius: '1px' }} />
          <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1f2937', fontSize: isMobile ? '0.85rem' : '1rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.8em' }}>Score </span> 
            <span style={{ color: '#10b981' }}>{score}</span>
          </span>
        </div>

        <motion.div 
          animate={timeLeft <= 5 ? { scale: [1, 1.1, 1], rotate: [0, -2, 2, 0] } : {}}
          transition={{ repeat: timeLeft <= 5 ? Infinity : 0, duration: 0.4 }}
          style={{ 
            fontFamily: 'var(--font-main)', 
            fontWeight: '900', 
            color: '#fff', 
            background: timeLeft <= 5 ? '#ef4444' : '#3b82f6', 
            border: `3px solid ${timeLeft <= 5 ? '#991b1b' : '#1e3a8a'}`, 
            borderBottom: `7px solid ${timeLeft <= 5 ? '#7f1d1d' : '#1e3a8a'}`, 
            borderRadius: '20px', 
            padding: '8px 16px', 
            fontSize: isMobile ? '0.9rem' : '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            boxShadow: `0 4px 12px ${timeLeft <= 5 ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`
          }}
        >
          <Timer size={20} strokeWidth={4} /> {timeLeft}s
        </motion.div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.9, y: 6 }}
        onClick={() => setShowMenuConfirm(true)}
        style={{ 
          border: '3px solid #1f2937', 
          borderBottom: '6px solid #1f2937', 
          background: '#f8fafc', 
          color: '#1f2937', 
          borderRadius: '16px', 
          padding: '8px 16px', 
          fontFamily: 'var(--font-main)', 
          fontWeight: '900', 
          fontSize: isMobile ? '0.85rem' : '0.95rem', 
          cursor: 'pointer' 
        }}
      >
        Exit
      </motion.button>
    </motion.div>

    <AnimatePresence>
      {showMenuConfirm && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          style={{ 
            background: '#fff', 
            border: '3px solid #1f2937', 
            borderBottom: '8px solid #1f2937', 
            borderRadius: '24px', 
            padding: isMobile ? '20px' : '24px', 
            display: 'grid', 
            gap: '16px', 
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1f2937', fontSize: isMobile ? '1.1rem' : '1.3rem' }}>{t.returnMenuConfirmTitle}</span>
            <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#64748b', fontSize: isMobile ? '0.9rem' : '1rem' }}>{t.returnMenuConfirmBody}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.9, y: 6 }}
              onClick={() => setShowMenuConfirm(false)}
              style={{ flex: 1, border: '3px solid #cbd5e1', borderBottom: '6px solid #94a3b8', background: '#f8fafc', color: '#475569', borderRadius: '16px', padding: '12px', fontFamily: 'var(--font-main)', fontWeight: '900', fontSize: '1rem', cursor: 'pointer' }}
            >
              Stay
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.9, y: 6 }}
              onClick={resetQuiz}
              style={{ flex: 1, border: '3px solid #b91c1c', borderBottom: '6px solid #991b1b', background: '#ef4444', color: '#fff', borderRadius: '16px', padding: '12px', fontFamily: 'var(--font-main)', fontWeight: '900', fontSize: '1rem', cursor: 'pointer' }}
            >
              Quit
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <motion.div
      key={`q-${currentIndex}`} 
      initial={{ scale: 0.85, opacity: 0, rotate: -3, y: 40 }}
      animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 12, mass: 1.2 }}
      style={{
        background: '#fef9c3',
        border: '3px solid #ca8a04',
        borderBottom: '8px solid #a16207',
        borderRadius: '24px',
        padding: isMobile ? '24px 20px' : '32px 32px',
        display: 'grid',
        gap: '12px',
        position: 'relative',
        boxShadow: '0 8px 24px rgba(234, 179, 8, 0.2)'
      }}
    >
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <motion.span 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          style={{ 
            fontFamily: 'var(--font-main)', 
            fontWeight: '900', 
            color: '#fff', 
            fontSize: '0.8rem', 
            background: '#eab308', 
            padding: '4px 12px', 
            borderRadius: '12px', 
            border: '2.5px solid #a16207', 
            display: 'inline-block' 
          }}
        >
          Question
        </motion.span>
      </div>
      <span style={{ 
        fontFamily: 'var(--font-main)', 
        fontWeight: '900', 
        color: '#422006', 
        fontSize: isMobile ? '1.2rem' : '1.5rem', 
        lineHeight: 1.3,
        marginTop: '4px'
      }}>
        {currentQuestion.prompt}
      </span>
    </motion.div>

    <AnimatePresence>
      {orderingHintLines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: '#f1f5f9',
            border: '3px solid #94a3b8',
            borderBottom: '6px solid #64748b',
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'grid',
            gap: '8px',
            position: 'relative',
            marginLeft: '8px'
          }}
        >
          <div style={{ position: 'absolute', left: -10, top: '24px', width: 6, height: 32, background: '#64748b', borderRadius: '3px' }} />
          <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#64748b', fontSize: '0.8rem', letterSpacing: '1px' }}>Reference data</span>
          {orderingHintLines.map((line) => (
            <span key={line} style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#334155', fontSize: '0.95rem', lineHeight: 1.3 }}>• {line}</span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            feedbackText={showCorrect ? 'Correct!' : showWrong ? 'Wrong!' : ''}
            onClick={() => handleChoiceSelect(index)}
          />
        );
      })}
    </div>

    <AnimatePresence>
      {feedback && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          style={{ 
            fontFamily: 'var(--font-main)', 
            fontWeight: '900', 
            color: '#fff', 
            background: feedback === t.correct ? '#10b981' : '#ef4444', 
            border: `3px solid ${feedback === t.correct ? '#065f46' : '#991b1b'}`, 
            borderBottom: `8px solid ${feedback === t.correct ? '#064e3b' : '#7f1d1d'}`,
            borderRadius: '24px', 
            padding: '16px', 
            fontSize: '1.2rem', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '12px',
            marginTop: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <span>{feedback === t.correct ? '🏆 Excellent!' : '🚨 Oops!'}</span>
          <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />
          <span>{t.nextUp}</span>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default QuestionsPlayingSection;
