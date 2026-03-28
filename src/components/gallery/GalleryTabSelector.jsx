import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { HOVER_LIFT_SM, TAP_SCALE_DEFAULT } from '../shared/animationPresets';
import { TABS } from './galleryConfig';

const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const GalleryTabSelector = ({ activeTab, setActiveTab, isMobile, tabLabels }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const currentTab = TABS[activeTab];
  const Icon = currentTab.icon;
  const localized = tabLabels[currentTab.id] || { title: currentTab.id, short: currentTab.id };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (idx) => {
    setActiveTab(idx);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 100, minWidth: isMobile ? '180px' : '220px' }}>
      {/* Toggle Button */}
      <motion.button
        onClick={toggleDropdown}
        whileHover={HOVER_LIFT_SM}
        whileTap={TAP_SCALE_DEFAULT}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%',
          padding: isMobile ? '12px 20px' : '14px 24px',
          background: '#ffffff',
          color: currentTab.color,
          border: `3px solid ${currentTab.color}`,
          borderBottom: `8px solid ${currentTab.color}`,
          borderRadius: '16px',
          fontFamily: '"Sniglet", "Coming Soon", cursive',
          fontSize: isMobile ? '1rem' : '1.1rem',
          fontWeight: '400',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon size={isMobile ? 18 : 20} />
          <span>{capitalizeFirst(localized.title)}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 15, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '3px solid #e5e7eb',
              borderBottom: '8px solid #e5e7eb',
              borderRadius: '20px',
              padding: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {TABS.map((tab, idx) => {
              const isActive = activeTab === idx;
              const TabIcon = tab.icon;
              const tabLocalized = tabLabels[tab.id] || { title: tab.id, short: tab.id };
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleSelect(idx)}
                  whileHover={{ x: 4, background: isActive ? `${tab.color}15` : '#f9fafb' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 20px',
                    background: isActive ? `${tab.color}10` : 'transparent',
                    color: isActive ? tab.color : '#64748b',
                    border: 'none',
                    borderRadius: '12px',
                    fontFamily: '"Sniglet", "Coming Soon", cursive',
                    fontSize: isMobile ? '0.95rem' : '1.05rem',
                    fontWeight: '400',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <TabIcon size={18} />
                  <span>{capitalizeFirst(tabLocalized.title)}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryTabSelector;

