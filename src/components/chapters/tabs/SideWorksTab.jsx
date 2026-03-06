import { motion } from 'framer-motion';
import { BookMarked } from 'lucide-react';

const SideWorksTab = ({
  isMobile,
  sideWorks,
  onReadChapter,
  isFinished,
  trackExternalLink,
  cancelExternalLink,
  markFinished,
  unmarkFinished,
  getReadCount,
  incrementReadCount,
  getRemainingCooldown,
  pendingLinks,
  t,
  uiLanguage,
  ChapterRowComponent,
}) => (
  <div
    style={{
      width: '100%',
      padding: isMobile ? '24px 8px 10px 8px' : '28px 40px',
      minHeight: isMobile ? 'auto' : '600px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible',
      flex: 1,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: '10px',
        rowGap: '4px',
        marginBottom: isMobile ? '16px' : '20px',
      }}
    >
      <BookMarked size={22} style={{ color: '#0ea5e9', flexShrink: 0 }} />
      <span
        style={{
          fontFamily: 'Sniglet, var(--font-main)',
          color: '#6b7280',
          fontSize: '1.3rem',
          fontWeight: 'normal',
          lineHeight: 1.1,
          flexShrink: 0,
        }}
      >
        {t.sideWorks}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-hand)',
          color: '#94a3b8',
          fontSize: '0.84rem',
          lineHeight: 1.1,
        }}
      >
        {t.sideWorksDescription || 'Side works by Takamatsu-sensei from earlier years or special events, unrelated to the main story.'}
      </span>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}
    >
      {sideWorks.map((story, idx) => (
        <ChapterRowComponent
          key={story.number}
          chapter={story}
          index={idx}
          isMobile={isMobile}
          onReadChapter={onReadChapter}
          isFinished={isFinished}
          trackExternalLink={trackExternalLink}
          cancelExternalLink={cancelExternalLink}
          markFinished={markFinished}
          unmarkFinished={unmarkFinished}
          getReadCount={getReadCount}
          incrementReadCount={incrementReadCount}
          getRemainingCooldown={getRemainingCooldown}
          pendingLinks={pendingLinks}
          t={t}
          uiLanguage={uiLanguage}
        />
      ))}
    </motion.div>
  </div>
);

export default SideWorksTab;
