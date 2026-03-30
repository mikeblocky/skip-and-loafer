import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { ListRow } from '../../../sync/syncSharedComponents';

const QuestionsFinishedSection = ({ isMobile, t, score, questions, playerName, resetQuiz }) => (
  <div style={{ display: 'grid', gap: '20px' }}>
    <ListRow
      index={0}
      noteColor={2}
      numberLine1="END"
      numberLine2="✓"
      title={`${t.finalScore}: ${score}/${questions.length}`}
      isMobile={isMobile}
      subtitle={<span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#4b5563', fontWeight: 'bold' }}>{playerName?.trim() || 'Player'}</span>}
    />
    
    <motion.div
       initial={{ scale: 0.9, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       transition={{ type: 'spring', bounce: 0.6 }}
       style={{ background: '#fff', border: '4px solid #1f2937', borderBottom: '8px solid #1f2937', borderRadius: '16px', padding: isMobile ? '20px' : '24px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}
    >
      <div style={{ textAlign: 'center' }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1f2937', fontSize: isMobile ? '1.5rem' : '2rem' }}>
          {score === questions.length ? 'PERFECT!' : score > questions.length / 2 ? 'GREAT JOB!' : 'NICE TRY!'}
        </span>
        <span style={{ display: 'block', fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#4b5563', fontSize: isMobile ? '0.9rem' : '1.1rem', marginTop: '4px' }}>
          You scored {score} out of {questions.length}
        </span>
      </div>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.95, y: 4 }}
        onClick={resetQuiz}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '4px solid #1e3a8a', borderBottom: '8px solid #1e3a8a', borderRadius: '16px', padding: isMobile ? '14px' : '18px', background: '#3b82f6', color: '#fff', fontFamily: 'var(--font-main)', fontWeight: '900', fontSize: isMobile ? '1.1rem' : '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
      >
        <RotateCcw size={isMobile ? 18 : 22} strokeWidth={3} />
        {t.playAgain}
      </motion.button>
    </motion.div>
  </div>
);

export default QuestionsFinishedSection;
