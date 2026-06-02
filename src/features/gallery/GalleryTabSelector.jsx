import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '../../utils/haptics';
import { TABS } from './galleryConfig';

const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const GalleryTabSelector = ({ activeTab, setActiveTab, isMobile, tabLabels }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const btn = container.querySelector(`[data-tab-idx="${activeTab}"]`);
      if (btn) {
        const offsetLeft = btn.offsetLeft;
        const width = btn.offsetWidth;
        const containerWidth = container.offsetWidth;
        container.scrollTo({
          left: offsetLeft - (containerWidth / 2) + (width / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab]);

  const handleSelect = (idx) => {
    triggerHaptic('tap');
    setActiveTab(idx);
  };

  return (
    <div
      ref={containerRef}
      className={isMobile ? "hide-scrollbar" : ""}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        maxWidth: '100%',
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        padding: isMobile ? '4px 2px 8px 2px' : '4px',
        margin: '0',
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        justifyContent: isMobile ? 'flex-start' : 'center',
        scrollSnapType: isMobile ? 'x proximity' : 'none',
      }}
    >
      {TABS.map((tab, idx) => {
        const isActive = activeTab === idx;
        const Icon = tab.icon;
        const tabLocalized = tabLabels[tab.id] || { title: tab.id, short: tab.id };
        const labelText = capitalizeFirst(isMobile ? (tabLocalized.short || tabLocalized.title) : tabLocalized.title);

        return (
          <motion.button
            key={tab.id}
            data-tab-idx={idx}
            onClick={() => handleSelect(idx)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96, y: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: isActive ? '6px 11px 8px 11px' : '7px 11px 7px 11px',
              background: isActive ? 'var(--themed-card-bg, #ffffff)' : `${tab.color}10`,
              color: tab.color,
              border: `2px solid ${tab.color}${isActive ? '' : '35'}`,
              borderBottom: isActive ? `5px solid ${tab.color}` : `2px solid ${tab.color}35`,
              borderRadius: '12px',
              fontFamily: '"Sniglet", "Coming Soon", cursive',
              fontSize: isMobile ? '0.82rem' : '0.86rem',
              fontWeight: isActive ? '700' : '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? `0 4px 12px ${tab.color}20` : `0 2px 4px ${tab.color}05`,
              scrollSnapAlign: 'start',
              flexShrink: 0,
            }}
          >
            <Icon size={isMobile ? 13 : 15} strokeWidth={2.4} />
            <span>{labelText}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default GalleryTabSelector;
