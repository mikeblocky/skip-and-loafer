import { motion } from 'framer-motion';
import { triggerHaptic } from '../../../../utils/haptics';

const SetupOptionCard = ({ label, selected, isMobile, onClick, color = '#ef4444', title }) => {
  const handlePress = () => {
    triggerHaptic('selection');
    onClick?.();
  };

  // Generate a predictable tilt direction based on string length to give it organic, playful movement
  const tiltDirection = label.length % 2 === 0 ? 1 : -1;

  return (
    <motion.button
      whileHover={{ y: -4, rotate: tiltDirection * 3, scale: 1.05 }}
      whileTap={{ scale: 0.85, y: 6, rotate: tiltDirection * -2 }}
      title={title}
      onClick={handlePress}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: isMobile ? '44px' : '52px',
        border: selected ? `3px solid ${color}` : `3px solid #cbd5e1`,
        background: selected ? color : '#f8fafc',
        borderBottom: selected ? `7px solid ${color}` : `6px solid #94a3b8`,
        borderRadius: '16px',
        padding: isMobile ? '8px 12px' : '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: selected ? `0 8px 16px rgba(0,0,0,0.15)` : '0 4px 8px rgba(0,0,0,0.05)',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: selected ? 10 : 1,
      }}
    >
      <span style={{ 
        fontFamily: 'var(--font-main)', 
        fontWeight: '900', 
        color: selected ? '#fff' : '#475569', 
        fontSize: isMobile ? '0.95rem' : '1.1rem', 
        lineHeight: 1.1, 
        letterSpacing: '0.5px',
        textShadow: selected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
      }}>
        {label}
      </span>
      
      {/* Gamified Personality Badge */}
      {selected && (
        <motion.div 
           initial={{ scale: 0, rotate: -90, y: 10 }} 
           animate={{ scale: 1, rotate: tiltDirection * 12, y: 0 }} 
           transition={{ type: 'spring', stiffness: 600, damping: 10, mass: 0.8 }}
           style={{
             position: 'absolute',
             top: -12,
             right: -10,
             background: '#fef3c7',
             border: '3px solid #f59e0b',
             borderBottom: '5px solid #d97706',
             borderRadius: '50%',
             width: isMobile ? '24px' : '28px',
             height: isMobile ? '24px' : '28px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             color: '#b45309',
             fontSize: isMobile ? '13px' : '16px',
             fontWeight: '900',
             boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
             zIndex: 20
           }}
        >
          !
        </motion.div>
      )}
    </motion.button>
  );
};

export default SetupOptionCard;
