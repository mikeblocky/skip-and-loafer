import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, AlertTriangle } from 'lucide-react';
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
}) => {
  void showMenuConfirm;
  void resetQuiz;

  const getTimerStyles = (time) => {
    if (time <= 5) {
      return {
        bg: '#ef4444',
        border: '#991b1b',
        bottom: '#7f1d1d',
        shadow: 'rgba(239,68,68,0.4)',
        pulse: true,
        shake: true,
      };
    }
    if (time <= 15) {
      return {
        bg: '#f59e0b',
        border: '#b45309',
        bottom: '#92400e',
        shadow: 'rgba(245,158,11,0.3)',
        pulse: false,
        shake: false,
      };
    }
    return {
      bg: '#3b82f6',
      border: '#2563eb',
      bottom: '#1d4ed8',
      shadow: 'rgba(59,130,246,0.3)',
      pulse: false,
      shake: false,
    };
  };

  const timerStyle = getTimerStyles(timeLeft);
  const questionCardAnimation = timerStyle.shake
    ? { scale: 1, opacity: 1, rotate: 0, y: 0, x: [0, -3, 3, -2, 2, 0] }
    : { scale: 1, opacity: 1, rotate: 0, y: 0, x: 0 };
  const questionCardTransition = timerStyle.shake
    ? { x: { repeat: Infinity, duration: 0.18, ease: 'linear' }, scale: { type: 'spring', stiffness: 500, damping: 12 }, opacity: { duration: 0.2 }, rotate: { duration: 0.2 }, y: { duration: 0.2 } }
    : { type: 'spring', stiffness: 500, damping: 12, mass: 1.2 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: isMobile ? '104px' : '40px' }}>
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: '#fff', border: '2.5px solid #1f2937', borderBottom: '5px solid #1f2937', borderRadius: '16px', padding: '8px 16px', display: 'flex', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontWeight: '400', color: '#1f2937', fontSize: isMobile ? '0.92rem' : '1rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.8em' }}>{currentIndex + 1}</span>/{questions.length}
            </span>
            <div style={{ width: '2.5px', background: '#e2e8f0', borderRadius: '1.2px' }} />
            <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontWeight: '400', color: '#1f2937', fontSize: isMobile ? '0.92rem' : '1rem' }}>
              <span style={{ color: '#10b981' }}>{score}</span>
            </span>
          </div>

          <motion.div
            animate={timerStyle.pulse ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ repeat: timerStyle.pulse ? Infinity : 0, duration: 0.5 }}
            style={{
              fontFamily: 'var(--font-main)',
              fontWeight: '900',
              color: '#fff',
              background: timerStyle.bg,
              border: `2.5px solid ${timerStyle.border}`,
              borderBottom: `5px solid ${timerStyle.bottom}`,
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: isMobile ? '0.9rem' : '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: `0 6px 16px ${timerStyle.shadow}`,
            }}
          >
            <Timer size={20} strokeWidth={4} /> {timeLeft}{t.secondUnit || 's'}
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.015, y: -1.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowMenuConfirm(true)}
          style={{
            border: '2.5px solid #1f2937',
            borderBottom: '5px solid #1f2937',
            background: '#f8fafc',
            color: '#ef4444',
            borderRadius: '16px',
            padding: '10px 18px',
            fontFamily: 'var(--font-main)',
            fontWeight: '900',
            fontSize: isMobile ? '0.85rem' : '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          {t.leaveQuiz}
        </motion.button>
      </motion.div>

      <motion.div
        key={`q-${currentIndex}`}
        initial={{ scale: 0.85, opacity: 0, rotate: -3, y: 40 }}
        animate={questionCardAnimation}
        transition={questionCardTransition}
        style={{
          background: 'var(--themed-note-bg-1, #fef9c3)',
          border: '2.5px solid var(--themed-note-border-1, #ca8a04)',
          borderBottom: '6px solid var(--themed-note-bottom-1, #a16207)',
          borderRadius: '16px',
          padding: isMobile ? '12px 14px' : '16px 20px',
          display: 'grid',
          gap: '6px',
          position: 'relative',
          boxShadow: '0 8px 24px rgba(234, 179, 8, 0.2)',
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
              color: '#ffffff',
              fontSize: '0.8rem',
              background: 'var(--themed-note-border-1, #eab308)',
              padding: '6px 14px',
              borderRadius: '12px',
              border: '2.5px solid var(--themed-note-bottom-1, #a16207)',
              display: 'inline-block',
            }}
          >
            {t.question}
          </motion.span>
        </div>
        <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontWeight: '400', color: 'var(--note-text, #422006)', fontSize: isMobile ? '1.14rem' : '1.34rem', lineHeight: 1.25, marginTop: '4px' }}>
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
              border: '2.5px solid #94a3b8',
              borderBottom: '5px solid #64748b',
              borderRadius: '20px',
              padding: '16px 20px',
              display: 'grid',
              gap: '8px',
              position: 'relative',
              marginLeft: '8px',
            }}
          >
            <div style={{ position: 'absolute', left: -10, top: '24px', width: 6, height: 32, background: '#64748b', borderRadius: '3px' }} />
            <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontWeight: '400', color: '#64748b', fontSize: '0.8rem', letterSpacing: '1px' }}>{t.referenceData || 'Reference data'}</span>
            {orderingHintLines.map((line) => (
              <span key={line} style={{ fontFamily: 'Sniglet, var(--font-main)', fontWeight: '400', color: '#334155', fontSize: '0.95rem', lineHeight: 1.3 }}>- {line}</span>
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
              feedbackText={showCorrect ? t.correct : showWrong ? t.wrong : ''}
              onClick={() => handleChoiceSelect(index)}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            style={{
              fontFamily: 'var(--font-main)',
              fontWeight: '900',
              color: '#fff',
              background: feedback === t.correct ? '#10b981' : '#ef4444',
              border: `3.5px solid ${feedback === t.correct ? '#065f46' : '#991b1b'}`,
              borderBottom: `6px solid ${feedback === t.correct ? '#064e3b' : '#7f1d1d'}`,
              borderRadius: '16px',
              padding: '10px 14px',
              fontSize: '1.05rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 10px 24px rgba(0,0,0,0.15)',
            }}
          >
            {feedback === t.correct ? <Trophy size={20} /> : <AlertTriangle size={20} />}
            <span>{feedback === t.correct ? (t.excellent || 'Excellent!') : (t.oops || 'Oops!')}</span>
            <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />
            <span>{t.nextUp}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionsPlayingSection;


