import { motion } from 'framer-motion';
import { NOTE_PALETTES } from '../../../sync/syncConfig';

const ChoiceChapterCard = ({ index, text, isMobile, isLocked, isCorrect, isWrong, isDimmed, onClick, feedbackText }) => {
  const note = NOTE_PALETTES[index % NOTE_PALETTES.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: index * 0.03, duration: 0.22 }}
      whileHover={!isMobile && !isLocked ? { scale: 1.012, y: -1.5, boxShadow: `0 4px 12px ${note.border}60` } : {}}
      onClick={isLocked ? undefined : onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '7px' : '9px',
        padding: isMobile ? '8px 9px' : '9px 11px',
        background: note.bg,
        border: `1.5px solid ${note.border}80`,
        borderBottom: `2px solid ${note.border}`,
        borderRadius: '8px',
        boxShadow: `0 2px 5px ${note.border}25`,
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isDimmed ? 0.76 : 1,
      }}
    >
      <div style={{ position: 'absolute', top: '-1px', left: isMobile ? '9px' : '12px', width: isMobile ? '16px' : '22px', height: isMobile ? '6px' : '7px', background: `${note.border}50`, borderRadius: '0 0 3px 3px' }} />
      <div
        style={{
          width: isMobile ? '24px' : '28px',
          height: isMobile ? '24px' : '28px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${note.border}40, ${note.border}80)`,
          border: `1.5px solid ${note.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: note.accent, fontSize: isMobile ? '0.64rem' : '0.7rem' }}>{index + 1}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-hand)', color: '#374151', fontWeight: 'bold', fontSize: isMobile ? '0.8rem' : '0.9rem', lineHeight: 1.25 }}>{text}</span>
      </div>
      {feedbackText ? (
        <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: isMobile ? '0.58rem' : '0.64rem', color: isCorrect ? '#059669' : isWrong ? '#dc2626' : '#9ca3af' }}>
          {feedbackText}
        </span>
      ) : null}
    </motion.div>
  );
};

export default ChoiceChapterCard;
