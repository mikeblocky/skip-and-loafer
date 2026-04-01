import { motion } from 'framer-motion';
import { NOTE_PALETTES } from '../../../sync/syncConfig';

const ChoiceChapterCard = ({ index, text, isMobile, isLocked, isCorrect, isWrong, isDimmed, onClick, feedbackText }) => {
  const note = NOTE_PALETTES[index % NOTE_PALETTES.length];
  
  // Organic movement: predict tilt based on index
  const tilt = (index % 2 === 0 ? 1 : -1) * 2.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, rotate: tilt, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 18, delay: index * 0.08 }}
      whileHover={!isMobile && !isLocked ? { scale: 1.025, y: -10, rotate: 0, boxShadow: `0 12px 0 ${note.border}` } : {}}
      whileTap={!isLocked ? { scale: 0.9, y: 8, rotate: 0 } : {}}
      onClick={isLocked ? undefined : onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '10px' : '14px',
        padding: isMobile ? '12px 14px' : '14px 18px',
        background: isCorrect ? '#d1fae5' : isWrong ? '#fee2e2' : isLocked ? '#f1f5f9' : '#fff',
        border: `3.5px solid ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : isLocked ? '#cbd5e1' : note.border}`,
        borderBottom: `${isMobile ? '6px' : '8.5px'} solid ${isCorrect ? '#059669' : isWrong ? '#dc2626' : isLocked ? '#94a3b8' : note.border}`,
        borderRadius: '20px',
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isDimmed ? 0.45 : 1,
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: isLocked ? 1 : 2,
      }}
    >
      <div
        style={{
          width: isMobile ? '30px' : '36px',
          height: isMobile ? '30px' : '36px',
          borderRadius: '50%',
          background: isCorrect ? '#10b981' : isWrong ? '#ef4444' : note.border + '30',
          border: `2px solid ${isCorrect ? '#059669' : isWrong ? '#dc2626' : note.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isCorrect || isWrong ? '0 2px 4px rgba(0,0,0,0.1)' : 'inset 0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', color: isCorrect || isWrong ? '#fff' : note.accent, fontSize: isMobile ? '0.85rem' : '1rem' }}>
          {index + 1}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ 
          fontFamily: 'Sniglet, var(--font-main)', 
          color: isCorrect ? '#064e3b' : isWrong ? '#7f1d1d' : isLocked ? '#64748b' : '#1e293b', 
          fontWeight: '400', 
          fontSize: isMobile ? '1.14rem' : '1.24rem', 
          lineHeight: 1.2 
        }}>
          {text}
        </span>
      </div>

      {feedbackText && (
        <motion.div
           initial={{ scale: 0, rotate: -20, y: 10 }}
           animate={{ scale: 1, rotate: tilt * 3, y: 0 }}
           transition={{ type: 'spring', stiffness: 600, damping: 12 }}
           style={{ 
             fontFamily: 'var(--font-main)', 
             fontWeight: '900', 
             fontSize: isMobile ? '0.75rem' : '0.9rem', 
             color: '#fff',
             background: isCorrect ? '#10b981' : '#ef4444',
             padding: '4px 12px',
             borderRadius: '12px',
             border: `2.5px solid ${isCorrect ? '#059669' : '#dc2626'}`,
             boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
             zIndex: 10,
             whiteSpace: 'nowrap'
           }}>
          {feedbackText}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChoiceChapterCard;
