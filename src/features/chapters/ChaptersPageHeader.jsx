import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Pin } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import PaperHeadingBadge from '../../components/shared/paper/PaperHeadingBadge';
import PaperPageHeader from '../../components/shared/paper/PaperPageHeader';

const CHAPTERS_FONT_FAMILY = 'var(--font-paper)';

const ChaptersSubtabSelector = () => null;

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
