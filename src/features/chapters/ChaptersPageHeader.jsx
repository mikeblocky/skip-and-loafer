import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Pin } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import PaperHeadingBadge from '../../components/shared/paper/PaperHeadingBadge';
import PaperPageHeader from '../../components/shared/paper/PaperPageHeader';

const CHAPTERS_FONT_FAMILY = 'var(--font-paper)';

const ChaptersSubtabSelector = ({ isMobile, activeSubtab, setActiveSubtab, t, uiLanguage, tabs = ['main', 'side'] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const normalizedTabs = tabs
    .map((tab) => {
      if (typeof tab === 'string') {
        return {
          id: tab,
          label: tab === 'main' ? (t.mainStory || 'Main story') : (t.sideWorks || 'Side works'),
          color: tab === 'main' ? '#0ea5e9' : '#f43f5e',
        };
      }

      return {
        id: tab?.id || 'main',
        label: tab?.label || (tab?.id === 'side' ? (t.sideWorks || 'Side works') : (t.mainStory || 'Main story')),
        color: tab?.color || (tab?.id === 'side' ? '#f43f5e' : '#0ea5e9'),
      };
    })
    .filter(Boolean);
  const currentTab = normalizedTabs.find((tab) => tab.id === activeSubtab) || normalizedTabs[0] || {
    id: 'main',
    label: t.mainStory || 'Main story',
    color: '#0ea5e9',
  };
  const currentLabel = currentTab.label || '';
  const isLongLabel = currentLabel.length > 10;

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

  const handleSelect = (id) => {
    triggerHaptic('tap');
    setActiveSubtab(id);
    setIsOpen(false);
  };

  if (normalizedTabs.length <= 1) return null;

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 100, minWidth: isMobile ? '180px' : '180px', maxWidth: isMobile ? '100%' : 'min(100vw - 64px, 320px)' }}>
      <motion.button
        onClick={() => setIsOpen((previous) => !previous)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98, y: 1 }}
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
          fontFamily: CHAPTERS_FONT_FAMILY,
          fontSize: isMobile ? '1.02rem' : (isLongLabel ? '0.96rem' : '1rem'),
          fontWeight: '400',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          whiteSpace: 'normal',
          lineHeight: 1.08,
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>{currentLabel}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 15, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
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
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {normalizedTabs.map((tab) => {
              const isActive = activeSubtab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleSelect(tab.id)}
                  whileHover={{ x: 4, background: isActive ? `${tab.color}15` : '#f9fafb' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '100%',
                    padding: '14px 20px',
                    background: isActive ? `${tab.color}10` : 'transparent',
                    color: isActive ? tab.color : '#64748b',
                    border: 'none',
                    borderRadius: '16px',
                    fontFamily: CHAPTERS_FONT_FAMILY,
                    fontSize: isMobile ? '0.9rem' : ((tab.label || '').length > 10 ? '0.92rem' : '0.98rem'),
                    fontWeight: '400',
                    cursor: 'pointer',
                    textAlign: 'left',
                    lineHeight: 1.08,
                  }}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const ChaptersPageHeader = ({
  isMobile,
  title,
  activeSubtab,
  setActiveSubtab,
  tabs,
  t,
  uiLanguage,
  unreadCount,
  unreadLabel,
}) => (
  <>
    <PaperPageHeader
      isMobile={isMobile}
      center={(
        <PaperHeadingBadge
          isMobile={isMobile}
          icon={BookOpen}
          title={title}
          palette={{
            borderColor: '#3b82f6',
            bottomColor: '#3b82f6',
            shadow: '0 8px 18px rgba(59, 130, 246, 0.1)',
          }}
          titleColor="#3b82f6"
          iconColor="#3b82f6"
          fontFamily={CHAPTERS_FONT_FAMILY}
        />
      )}
      rightSlot={(
        <ChaptersSubtabSelector
          isMobile={isMobile}
          activeSubtab={activeSubtab}
          setActiveSubtab={setActiveSubtab}
          t={t}
          uiLanguage={uiLanguage}
          tabs={tabs}
        />
      )}
      gapMobile="16px"
      paddingMobile="0"
      paddingDesktop="0"
    />

    {unreadCount > 0 ? (
      <div style={{ display: 'flex', justifyContent: 'center', padding: isMobile ? '30px 16px 0 16px' : '42px 40px 0 40px' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: isMobile ? '8px 18px' : '10px 24px',
            background: '#fef3c7',
            color: '#d97706',
            border: '3px solid #f59e0b',
            borderBottom: '8px solid #f59e0b',
            borderRadius: '20px',
            fontFamily: CHAPTERS_FONT_FAMILY,
            fontSize: isMobile ? '1.05rem' : '1.15rem',
            fontWeight: '400',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.15)',
          }}
        >
          <Pin size={isMobile ? 18 : 20} strokeWidth={3} />
          <span style={{ lineHeight: 1 }}>{unreadLabel}</span>
        </motion.div>
      </div>
    ) : null}
  </>
);

export default ChaptersPageHeader;
