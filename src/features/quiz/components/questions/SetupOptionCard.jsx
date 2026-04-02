import { motion } from 'framer-motion';
import { triggerHaptic } from '../../../../utils/haptics';

const SetupOptionCard = ({
  label,
  selected,
  isMobile,
  onClick,
  color = '#3b82f6',
  title,
  selectedLabel = 'Selected',
  tapToChooseLabel = 'Tap to choose',
}) => {
  const handlePress = () => {
    triggerHaptic('selection');
    onClick?.();
  };

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.96, y: 4 }}
      title={title}
      onClick={handlePress}
      className="sketchbook-border paper-interact"
      style={{
        width: '100%',
        minHeight: isMobile ? '86px' : '96px',
        border: `3.5px solid ${selected ? color : '#d7e0ec'}`,
        borderBottom: `9.5px solid ${selected ? color : '#b9c8d8'}`,
        background: selected ? `${color}14` : '#ffffff',
        borderRadius: '22px',
        padding: isMobile ? '14px 14px 12px' : '16px 16px 14px',
        display: 'grid',
        gap: '8px',
        alignContent: 'space-between',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: selected ? `0 14px 26px ${color}22` : '0 10px 18px rgba(148, 163, 184, 0.12)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'fit-content',
          minWidth: '38px',
          padding: '5px 10px',
          borderRadius: '999px',
          background: selected ? '#ffffff' : '#f8fafc',
          border: `2px solid ${selected ? color : '#cbd5e1'}`,
          color: selected ? color : '#64748b',
          fontFamily: 'Sniglet, var(--font-main)',
          fontSize: '0.85rem',
          fontWeight: '400',
          lineHeight: 1,
        }}
      >
        {label}
      </div>

      <div style={{ display: 'grid', gap: '4px' }}>
        <div
          style={{
            fontFamily: 'Sniglet, var(--font-main)',
            fontWeight: '400',
            color: '#0f172a',
            fontSize: isMobile ? '0.98rem' : '1.06rem',
            lineHeight: 1.15,
          }}
        >
          {title || label}
        </div>
        <div
          style={{
            fontSize: '0.84rem',
            lineHeight: 1.25,
            color: selected ? color : '#64748b',
            fontFamily: 'var(--font-main)',
            fontWeight: '600',
          }}
        >
          {selected ? selectedLabel : tapToChooseLabel}
        </div>
      </div>
    </motion.button>
  );
};

export default SetupOptionCard;
