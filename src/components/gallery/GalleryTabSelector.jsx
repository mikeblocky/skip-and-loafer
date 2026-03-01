import { motion } from 'framer-motion';
import { HOVER_LIFT_SM, TAP_SCALE_DEFAULT } from '../shared/animationPresets';
import { TABS } from './galleryConfig';

const GalleryTabSelector = ({ activeTab, setActiveTab, isMobile, tabLabels }) => (
  <div className="hide-scrollbar" style={{
    display: 'flex', gap: '6px', flexWrap: isMobile ? 'wrap' : 'nowrap',
    overflowX: isMobile ? 'visible' : 'auto',
    overflowY: 'visible',
    padding: '4px 0 6px 0',
    alignItems: 'center',
    justifyContent: isMobile ? 'center' : 'flex-start',
  }}>
    {TABS.map((tab, idx) => {
      const isActive = activeTab === idx;
      const Icon = tab.icon;
      const localized = tabLabels[tab.id] || { title: tab.id, short: tab.id };
      return (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(idx)}
          whileHover={HOVER_LIFT_SM}
          whileTap={TAP_SCALE_DEFAULT}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: isMobile ? '8px 10px' : '10px 14px',
            background: isActive ? tab.color : '#f3f4f6',
            color: isActive ? '#fff' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'var(--font-hand)',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            lineHeight: 1.3,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: isActive ? `0 4px 12px ${tab.color}40` : 'none',
            transition: 'all 0.2s',
            flexShrink: 0,
            minHeight: isMobile ? '36px' : '42px',
            overflow: 'visible',
          }}
        >
          <Icon size={isMobile ? 14 : 16} />
          {isMobile ? localized.short : localized.title}
        </motion.button>
      );
    })}
  </div>
);

export default GalleryTabSelector;
