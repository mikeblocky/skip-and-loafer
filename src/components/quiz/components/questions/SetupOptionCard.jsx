import { motion } from 'framer-motion';
import { TAP_SCALE_DEFAULT } from '../../../shared/animationPresets';
import { triggerHaptic } from '../../../../utils/haptics';
import { withOpacity } from '../../quizUtils';

const SetupOptionCard = ({ label, selected, isMobile, onClick, color = '#ef4444', title }) => {
  const handlePress = () => {
    triggerHaptic('selection');
    onClick?.();
  };

  return (
    <motion.button
      whileTap={TAP_SCALE_DEFAULT}
      title={title}
      onClick={handlePress}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: isMobile ? '32px' : '36px',
        border: selected ? `2px solid ${color}` : `1.5px solid ${withOpacity(color, '99')}`,
        background: selected ? withOpacity(color, '24') : withOpacity(color, '14'),
        borderBottom: selected ? `3px solid ${color}` : `2px solid ${withOpacity(color, '99')}`,
        borderRadius: '8px',
        padding: isMobile ? '2px 4px' : '3px 5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: selected ? `0 3px 10px ${withOpacity(color, '66')}` : `0 2px 5px ${withOpacity(color, '3a')}`,
      }}
    >
      <div style={{ position: 'absolute', top: '-1px', left: isMobile ? '8px' : '10px', width: isMobile ? '14px' : '18px', height: isMobile ? '5px' : '6px', background: withOpacity(color, '55'), borderRadius: '0 0 3px 3px' }} />
      <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: selected ? color : '#374151', fontSize: isMobile ? '0.72rem' : '0.8rem', lineHeight: 1.05 }}>{label}</span>
    </motion.button>
  );
};

export default SetupOptionCard;
