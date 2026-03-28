import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PlannerPage = lazy(() => import('../PlannerPage'));
const ChaptersPage = lazy(() => import('../ChaptersPage'));
const BlogPage = lazy(() => import('../BlogPage'));
const SyncPage = lazy(() => import('../SyncPage'));
const BirthdayPage = lazy(() => import('../BirthdayPage'));
const QuizPage = lazy(() => import('../QuizPage'));
const MysteryPage = lazy(() => import('../MysteryPage'));

const PAGE_SHELL_STYLE = {
  width: '100%',
  backgroundColor: 'var(--paper-white)',
  backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--line-blue) 32px)',
  backgroundSize: '100% 32px',
  borderRadius: '4px',
  flex: 1,
};

const TabFallback = ({ isMobile, label = 'Loading...' }) => (
  <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
    <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.95rem' : '1rem', color: '#9ca3af' }}>
      {label}
    </span>
  </div>
);

const AppTabContent = ({
  activePage,
  isMobile,
  uiLanguage,
  subtabShortcut,
  setReaderChapter,
  isFinished,
  trackExternalLink,
  cancelExternalLink,
  markFinished,
  unmarkFinished,
  getReadCount,
  incrementReadCount,
  getRemainingCooldown,
  pendingLinks,
  GalleryPage,
  finishedCount,
  finished,
  readCounts,
  reloadFromStorage,
  syncData,
  accessibilityPrefs,
  handleMainTouchStart,
  handleMainTouchEnd,
}) => {
  return (
    <motion.div
      id="main-content"
      role="main"
      aria-live="polite"
      className="planner-container"
      onTouchStart={handleMainTouchStart}
      onTouchEnd={handleMainTouchEnd}
      style={{
        width: '100%',
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        padding: activePage === 'home' ? (isMobile ? '10px 8px 14px' : '14px') : 0,
        zIndex: 10,
        pointerEvents: 'auto',
        minHeight: isMobile ? 0 : undefined,
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <AnimatePresence mode="wait">
        {activePage === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'contents' }}
          >
            <Suspense fallback={<TabFallback isMobile={isMobile} />}>
              <PlannerPage isMobile={isMobile} uiLanguage={uiLanguage} />
            </Suspense>
          </motion.div>
        )}

        {activePage === 'chapters' && (
          <motion.div
            key="chapters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ ...PAGE_SHELL_STYLE, display: 'flex', flexDirection: 'column' }}
          >
            <Suspense fallback={<TabFallback isMobile={isMobile} />}>
              <ChaptersPage
                isMobile={isMobile}
                uiLanguage={uiLanguage}
                subtabShortcut={subtabShortcut}
                onReadChapter={(ch) => setReaderChapter(ch)}
                isFinished={isFinished}
                trackExternalLink={trackExternalLink}
                cancelExternalLink={cancelExternalLink}
                markFinished={markFinished}
                unmarkFinished={unmarkFinished}
                getReadCount={getReadCount}
                incrementReadCount={incrementReadCount}
                getRemainingCooldown={getRemainingCooldown}
                pendingLinks={pendingLinks}
              />
            </Suspense>
          </motion.div>
        )}

        {activePage === 'gallery' && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ ...PAGE_SHELL_STYLE, display: 'flex', flexDirection: 'column' }}
          >
            <Suspense fallback={<TabFallback isMobile={isMobile} label="Loading gallery..." />}>
              <GalleryPage isMobile={isMobile} uiLanguage={uiLanguage} subtabShortcut={subtabShortcut} />
            </Suspense>
          </motion.div>
        )}

        {activePage === 'blog' && (
          <motion.div
            key="blog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ ...PAGE_SHELL_STYLE, display: 'flex', flexDirection: 'column' }}
          >
            <Suspense fallback={<TabFallback isMobile={isMobile} />}>
              <BlogPage isMobile={isMobile} uiLanguage={uiLanguage} />
            </Suspense>
          </motion.div>
        )}

        {activePage === 'sync' && (
          <motion.div
            key="sync"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ ...PAGE_SHELL_STYLE, display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}
          >
            <Suspense fallback={<TabFallback isMobile={isMobile} />}>
              <SyncPage
                isMobile={isMobile}
                uiLanguage={uiLanguage}
                subtabShortcut={subtabShortcut}
                finishedCount={finishedCount}
                finished={finished}
                readCounts={readCounts}
                reloadFromStorage={reloadFromStorage}
                onReadChapter={(ch) => setReaderChapter(ch)}
                trackExternalLink={trackExternalLink}
                cancelExternalLink={cancelExternalLink}
                markFinished={markFinished}
                unmarkFinished={unmarkFinished}
                incrementReadCount={incrementReadCount}
                getRemainingCooldown={getRemainingCooldown}
                pendingLinks={pendingLinks}
                syncData={syncData}
              />
            </Suspense>
          </motion.div>
        )}

        {activePage === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ ...PAGE_SHELL_STYLE, display: 'flex', flexDirection: 'column' }}
          >
            <Suspense fallback={<TabFallback isMobile={isMobile} />}>
              <QuizPage isMobile={isMobile} uiLanguage={uiLanguage} subtabShortcut={subtabShortcut} />
            </Suspense>
          </motion.div>
        )}

        {activePage === 'birthdays' && (
          <motion.div
            key="birthdays"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ ...PAGE_SHELL_STYLE, display: 'flex', flexDirection: 'column' }}
          >
            <Suspense fallback={<TabFallback isMobile={isMobile} />}>
              <BirthdayPage
                isMobile={isMobile}
                uiLanguage={uiLanguage}
                reduceMotion={accessibilityPrefs.reduceMotion}
                simplifyVisuals={accessibilityPrefs.simplifyVisuals}
              />
            </Suspense>
          </motion.div>
        )}

        {activePage === 'mystery' && (
          <motion.div
            key="mystery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ ...PAGE_SHELL_STYLE, display: 'flex', flexDirection: 'column' }}
          >
            <Suspense fallback={<TabFallback isMobile={isMobile} />}>
              <MysteryPage isMobile={isMobile} uiLanguage={uiLanguage} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AppTabContent;
