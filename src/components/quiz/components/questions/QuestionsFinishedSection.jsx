import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { ListRow } from '../../../sync/syncSharedComponents';
import { TAP_SCALE_DEFAULT } from '../../../shared/animationPresets';

const QuestionsFinishedSection = ({ isMobile, t, score, questions, playerName, resetQuiz }) => (
  <div style={{ display: 'grid', gap: '12px' }}>
    <ListRow
      index={0}
      noteColor={2}
      numberLine1="END"
      numberLine2="✓"
      title={`${t.finalScore}: ${score}/${questions.length}`}
      isMobile={isMobile}
      subtitle={<span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.75rem' : '0.85rem', color: '#6b7280' }}>{playerName?.trim() || 'Player'}</span>}
    />
    <motion.button
      whileTap={TAP_SCALE_DEFAULT}
      onClick={resetQuiz}
      style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1.5px solid #e5e7eb', borderRadius: '9999px', padding: isMobile ? '8px 14px' : '9px 16px', background: '#fff', color: '#6b7280', fontFamily: 'var(--font-hand)', fontWeight: 'bold', cursor: 'pointer' }}
    >
      <RotateCcw size={isMobile ? 12 : 14} />
      {t.playAgain}
    </motion.button>
  </div>
);

export default QuestionsFinishedSection;
