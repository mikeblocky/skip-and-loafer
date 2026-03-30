import { motion } from 'framer-motion';
import { History, Award, Calendar, ChevronRight } from 'lucide-react';
import { ListRow } from '../../sync/syncSharedComponents';
import { getDifficultyLabel, getQuestionSetLabel, normalizeScoreToHundred } from '../quizUtils';

const smashVariant = {
  hidden: { y: -80, scale: 0.8, opacity: 0, rotate: -3 },
  visible: { 
    y: 0, 
    scale: 1, 
    opacity: 1, 
    rotate: 0, 
    transition: { type: 'spring', stiffness: 500, damping: 12, mass: 1 } 
  }
};

const containerVariant = {
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const HistoryTab = ({ isMobile, t, displayedHistory }) => {
  const totalAttempts = displayedHistory.length;
  const bestScorePercent = displayedHistory.length > 0
    ? Math.max(...displayedHistory.map((item) => normalizeScoreToHundred(item.score)))
    : 0;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariant}
      style={{ display: 'grid', gap: '20px', padding: '10px' }}
    >
      {/* History Stats Header */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
        <motion.div 
          variants={smashVariant}
          whileHover={{ scale: 1.02, rotate: 1 }}
          style={{ 
            background: '#fff', 
            border: '4px solid #8b5cf6', 
            borderBottom: '10px solid #7c3aed', 
            borderRadius: '24px', 
            padding: '16px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            boxShadow: '0 8px 0 rgba(139, 92, 246, 0.1)'
          }}
        >
          <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '16px', border: '3px solid #8b5cf6' }}>
            <History size={28} color="#7c3aed" strokeWidth={3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#5b21b6', fontSize: '1.5rem', lineHeight: 1 }}>{totalAttempts}</div>
            <div style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#8b5cf6', fontSize: '0.9rem', marginTop: '2px' }}>Global attempts</div>
          </div>
        </motion.div>

        <motion.div 
          variants={smashVariant}
          whileHover={{ scale: 1.02, rotate: -1 }}
          style={{ 
            background: '#fff', 
            border: '4px solid #f59e0b', 
            borderBottom: '10px solid #d97706', 
            borderRadius: '24px', 
            padding: '16px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            boxShadow: '0 8px 0 rgba(245, 158, 11, 0.1)'
          }}
        >
          <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '16px', border: '3px solid #f59e0b' }}>
            <Award size={28} color="#d97706" strokeWidth={3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#92400e', fontSize: '1.5rem', lineHeight: 1 }}>{bestScorePercent}%</div>
            <div style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#f59e0b', fontSize: '0.9rem', marginTop: '2px' }}>Top record</div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gap: '14px' }}>
        <motion.div 
          variants={smashVariant}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px' }}
        >
           <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1f2937', fontSize: '1.2rem', letterSpacing: '0.5px' }}>
            Recent records
           </span>
        </motion.div>

        {displayedHistory.length === 0 && (
          <motion.div variants={smashVariant}>
            <ListRow
              index={1}
              noteColor={5}
              numberLine1="—"
              numberLine2="—"
              title={t.noHistory}
              isMobile={isMobile}
            />
          </motion.div>
        )}

        {displayedHistory.map((item, index) => (
          <motion.div 
            key={item.id || `${item.playedAt}-${index}`}
            variants={smashVariant}
            whileHover={{ scale: 1.01, x: 5 }}
          >
            <ListRow
              index={index + 2}
              noteColor={index + 6}
              numberLine1="#"
              numberLine2={String(index + 1)}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: '#1e293b', fontSize: '1.05rem' }}>
                    {item.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-hand)', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>scored {item.score}/{item.total}</span>
                </div>
              }
              isMobile={isMobile}
              subtitle={
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  <div style={{ 
                    background: '#f8fafc', 
                    border: '1.5px solid #e2e8f0', 
                    padding: '2px 8px', 
                    borderRadius: '8px',
                    fontFamily: 'var(--font-main)',
                    fontSize: '0.7rem',
                    fontWeight: '900',
                    color: '#64748b'
                  }}>
                    {getDifficultyLabel(item.difficultyMode, t)}
                  </div>
                  <div style={{ 
                    background: '#f8fafc', 
                    border: '1.5px solid #e2e8f0', 
                    padding: '2px 8px', 
                    borderRadius: '8px',
                    fontFamily: 'var(--font-main)',
                    fontSize: '0.7rem',
                    fontWeight: '900',
                    color: '#64748b'
                  }}>
                    {getQuestionSetLabel(item.questionSet, t)}
                  </div>
                </div>
              }
              rightContent={(
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                    <Calendar size={12} />
                    <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: '0.75rem' }}>
                      {new Date(item.playedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRight size={18} color="#cbd5e1" strokeWidth={3} />
                </div>
              )}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default HistoryTab;

