import { motion } from 'framer-motion';
import { ImagePlus, Package, PenLine, Trophy } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { toUiLabelCase } from '../../utils/textCase';

const SIDE_TAB_CONFIG = [
  { id: 'mystery', label: 'Mystery', icon: Package, color: '#f9a8d4', top: '120px' },
  { id: 'quiz', label: 'Quiz', icon: Trophy, color: '#ff9ca8', top: '178px' },
  { id: 'fanGallery', label: 'Fan works', icon: ImagePlus, color: '#9ec3ff', top: '236px' },
  { id: 'sign', label: 'Guestbook', icon: PenLine, color: '#ffab86', top: '294px' },
];

const SideTabs = ({ activePage, onPageChange, isMobile, labelsById }) => {
  if (isMobile) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: '16px',
        top: 0,
        height: '100dvh',
        width: '154px',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
      }}
    >
      {SIDE_TAB_CONFIG.map((tab) => {
        const isActive = activePage === tab.id;
        const Icon = tab.icon;
        const label = labelsById?.[tab.id]?.label || tab.label;

        return (
          <motion.button
            key={tab.id}
            onClick={() => {
              triggerHaptic('selection');
              onPageChange(tab.id);
            }}
            initial={{ x: 28, opacity: 0 }}
            animate={{ x: isActive ? 0 : 10, opacity: 1 }}
            whileHover={{ x: 0 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            style={{
              position: 'absolute',
              top: tab.top,
              right: 0,
              width: '148px',
              height: '48px',
              background: isActive
                ? 'linear-gradient(135deg, rgba(17, 29, 44, 0.92), rgba(29, 43, 61, 0.88))'
                : 'linear-gradient(135deg, rgba(14, 24, 38, 0.68), rgba(16, 30, 48, 0.42))',
              border: `1px solid ${isActive ? `${tab.color}a8` : 'rgba(242,233,214,0.12)'}`,
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '0 16px',
              gap: '10px',
              color: isActive ? '#f4ecd9' : 'rgba(244,236,217,0.76)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              boxShadow: isActive
                ? `0 12px 30px ${tab.color}22, inset 0 1px 0 rgba(255,255,255,0.08)`
                : '0 10px 24px rgba(3,8,15,0.26)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 18% 50%, ${tab.color}20, transparent 48%)`,
                opacity: isActive ? 1 : 0.7,
              }}
            />
            <span
              style={{
                width: '22px',
                minWidth: '22px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tab.color,
                zIndex: 1,
              }}
            >
              <Icon size={18} strokeWidth={2.1} />
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                lineHeight: 1,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                zIndex: 1,
              }}
            >
              {toUiLabelCase(label)}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default SideTabs;
