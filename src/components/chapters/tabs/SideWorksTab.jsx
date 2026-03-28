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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '16px', 
      marginBottom: isMobile ? '24px' : '32px',
      textAlign: 'center'
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 22px',
          borderRadius: '18px',
          background: '#ffffff',
          border: '3px solid #0ea5e9',
          borderBottom: '8px solid #0ea5e9',
          boxShadow: '0 4px 15px rgba(14, 165, 233, 0.1)',
        }}
      >
        <BookMarked size={isMobile ? 22 : 20} style={{ color: '#0ea5e9' }} />
        <span style={{ 
          fontFamily: '"Coming Soon", cursive', 
          color: '#0ea5e9', 
          fontSize: isMobile ? '1.35rem' : '1.25rem', 
          fontWeight: '900',
          lineHeight: 1
        }}>
          {t.sideWorks}
        </span>
      </motion.div>
      
      <p style={{
        fontFamily: 'var(--font-main)',
        color: '#64748b',
        fontSize: isMobile ? '0.9rem' : '1rem',
        lineHeight: 1.6,
        maxWidth: '500px',
        margin: 0,
        opacity: 0.9
      }}>
        {t.sideWorksDescription || 'Side works by Takamatsu-sensei from earlier years or special events, unrelated to the main story.'}
      </p>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: isMobile ? '12px' : '16px' }}
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
