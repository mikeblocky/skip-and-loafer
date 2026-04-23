import { motion } from 'framer-motion';
import { HelpCircle, ImagePlus, PenLine, Trophy, Package, MessageSquare } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { toUiLabelCase } from '../../utils/textCase';

const SIDE_TAB_CONFIG = [
  { id: 'wiki', label: 'Wiki', icon: HelpCircle, color: '#0ea5e9', top: '160px' },
  { id: 'quiz', label: 'Quiz', icon: Trophy, color: '#ff5757', top: '222px' },
  { id: 'mystery', label: 'Mystery', icon: Package, color: '#ec4899', top: '284px' },
  { id: 'fanGallery', label: 'Fan works', icon: ImagePlus, color: '#2563eb', top: '346px' },
  { id: 'sign', label: 'Guestbook', icon: PenLine, color: '#f97316', top: '408px' },
];

const SideTabs = ({ activePage, onPageChange, isMobile, labelsById }) => {
  if (isMobile) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100dvh',
        width: '60px',
        zIndex: 1000,
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
            className="sketchbook-border"
            onClick={() => {
              triggerHaptic('selection');
              onPageChange(tab.id);
            }}
            initial={{ x: 40 }}
            animate={{ x: isActive ? 5 : 20 }}
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'absolute',
              top: tab.top,
              right: 0,
              width: '130px',
              height: '52px',
              background: isActive ? '#ffffff' : tab.color,
              border: '3px solid #0f172a',
              borderRight: isActive ? '3px solid #ffffff' : '3px solid #0f172a',
              borderRadius: '16px 0 0 16px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: '10px',
              color: isActive ? tab.color : 'white',
              cursor: 'pointer',
              pointerEvents: 'auto',
              boxShadow: isActive 
                ? `inset 5px 0 0 ${tab.color}, 0 4px 20px ${tab.color}32`
                : '0 8px 18px rgba(0,0,0,0.16)',
              fontFamily: 'Sniglet, var(--font-main)',
              fontSize: '0.88rem',
              fontWeight: 'normal',
              textShadow: isActive ? 'none' : '0 1px 0 rgba(15, 23, 42, 0.18)',
              zIndex: isActive ? 30 : 5,
            }}
          >
            <Icon size={20} strokeWidth={2.5} />
            <span style={{ fontWeight: 'normal' }}>{toUiLabelCase(label)}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default SideTabs;
