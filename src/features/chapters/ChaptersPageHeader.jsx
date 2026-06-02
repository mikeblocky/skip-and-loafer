import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Pin } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import PaperHeadingBadge from '../../components/shared/paper/PaperHeadingBadge';
import PaperPageHeader from '../../components/shared/paper/PaperPageHeader';

const CHAPTERS_FONT_FAMILY = 'var(--font-paper)';

const ChaptersSubtabSelector = ({ isMobile, activeSubtab, setActiveSubtab, t, uiLanguage, tabs }) => {
  if (!tabs || tabs.length <= 1) return null;

  return (
    <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
      {tabs.map((tab) => {
        const isActive = activeSubtab === tab;
        let label = '';
        if (tab === 'main') label = t.mainStory || 'Main story';
        else if (tab === 'side') label = t.sideWorks || 'Side works';
        else if (tab === 'notes') label = t.myNotes || 'My notes';

        return (
          <motion.button
            key={tab}
            className={isActive ? "no-override" : ""}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              triggerHaptic('selection');
              setActiveSubtab(tab);
            }}
            style={{
              padding: isMobile ? '8px 14px' : '10px 20px',
              fontFamily: '"Sniglet", "Coming Soon", cursive',
              fontSize: isMobile ? '0.88rem' : '0.96rem',
              fontWeight: '400',
              cursor: 'pointer',
              border: isActive ? '2px solid var(--keycap-color, #3b82f6)' : '2px solid var(--surface-border, #cbd5e1)',
              borderBottom: isActive ? '5px solid var(--keycap-color, #1d4ed8)' : '5px solid var(--surface-border-strong, #94a3b8)',
              background: isActive ? 'var(--surface-card, #ffffff)' : 'var(--themed-card-inactive-bg, #fdfaf8)',
              color: isActive ? 'var(--keycap-color, #1d4ed8)' : 'var(--text-secondary, #475569)',
              borderRadius: '12px',
              boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.1)' : 'none',
              transition: 'all 0.15s ease',
              opacity: isActive ? 1 : 0.8,
            }}
          >
            {label}
          </motion.button>
        );
      })}
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


  </>
);

export default ChaptersPageHeader;
