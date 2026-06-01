import { Suspense } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import NavTabs from '../../components/shared/NavTabs';
import {
  AppDisclaimerModal,
  AppDecorativeLayer,
  BirthdayNotification,
  ChangelogPopup,
  RetirementPopup,
  MangaReader,
} from './appLazyComponents';
import AppTabContent from './AppTabContent';
import ReaderOverlayFallback from './ReaderOverlayFallback';
import { CHAPTERS, isMainChapter } from '../../data/chapters';

const skipLinkStyle = {
  position: 'absolute',
  left: '10px',
  top: '10px',
  zIndex: 1100,
  background: 'white',
  border: '2px solid var(--pop-blue)',
  borderRadius: '8px',
  padding: '6px 10px',
  color: '#374151',
  fontFamily: 'var(--font-hand)',
  fontWeight: 'bold',
  transform: 'translateY(-180%)',
  transition: 'transform 0.2s ease',
};

const shellViewportStyle = {
  minHeight: '100dvh',
  height: '100dvh',
  width: '100%',
  position: 'relative',
  overflowX: 'hidden',
  overflowY: 'visible',
};

const copyrightStyle = {
  display: 'none',
};

const AppChrome = ({ app }) => {
  const unreadCount = CHAPTERS.filter((chapter) => isMainChapter(chapter.number) && (chapter.links?.en || chapter.pages)).length -
    CHAPTERS.filter((chapter) => isMainChapter(chapter.number) && app.isFinished(chapter.number)).length;
  const safeUnreadCount = Math.max(0, unreadCount);

  return (
    <MotionConfig reducedMotion={app.accessibilityPrefs.reduceMotion ? 'always' : 'never'}>
      <div className="app-surface-shell" style={shellViewportStyle}>
        <a
          href="#main-content"
          style={skipLinkStyle}
          onFocus={(event) => {
            event.currentTarget.style.transform = 'translateY(0)';
          }}
          onBlur={(event) => {
            event.currentTarget.style.transform = 'translateY(-180%)';
          }}
        >
          {app.t.skipToContent}
        </a>

      {app.showDisclaimer && app.deferredShellMount && (
        <Suspense fallback={null}>
          <AppDisclaimerModal showDisclaimer={app.showDisclaimer} onClose={app.closeDisclaimer} />
        </Suspense>
      )}

      {app.showDecorativeLayer && (
        <Suspense fallback={null}>
          <AppDecorativeLayer
            accessibilityPrefs={app.accessibilityPrefs}
            isMobile={app.isMobile}
            activePage={app.activePage}
            showCharacterStickers={false}
            showCoverCards={false}
            handlePositionUpdate={app.handlePositionUpdate}
            stickerPositions={app.stickerPositions}
            stickerLayoutById={app.stickerLayoutById}
            cardPositions={app.cardPositions}
          />
        </Suspense>
      )}

      <AnimatePresence>
        {app.showUI && (
          <motion.div
            ref={app.mainScrollRef}
            className="hide-scrollbar app-shell-scroll"
            style={{
              position: 'relative',
              zIndex: 500,
              height: '100dvh',
              minHeight: '100dvh',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              overflowY: 'auto',
              overflowX: 'visible',
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorY: 'contain',
              padding: app.isMobile
                ? 'env(safe-area-inset-top, 0px) 0 calc(env(safe-area-inset-bottom, 0px) + 72px) 0'
                : '0 18px 16px',
              pointerEvents: 'auto',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {app.showMitsumiReplayBanner && (
              <motion.a
                href="/mitsumi"
                className="app-tactile"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: app.isMobile ? '4px' : '8px',
                  marginBottom: app.isMobile ? '8px' : '10px',
                  padding: app.isMobile ? '8px 12px' : '10px 14px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-hand)',
                  fontSize: app.isMobile ? '0.85rem' : '0.92rem',
                  fontWeight: 'bold',
                  color: '#be185d',
                  background: '#fdf2f8',
                  border: '2px solid #f9a8d4',
                  boxShadow: '0 4px 10px rgba(244,114,182,0.18)',
                  zIndex: 900,
                }}
              >
                Replay Mitsumi&apos;s birthday surprise!
              </motion.a>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: 'easeOut', delay: 0.01 }}
              style={{
                position: 'relative',
                scrollMarginTop: '0px',
                width: '100%',
                maxWidth: app.isMobile
                  ? '100%'
                  : (app.accessibilityPrefs.largeText ? '1380px' : '1320px'),
                minHeight: app.isMobile ? 'calc(100dvh - 72px)' : 'calc(100dvh - 16px)',
                height: app.isMobile ? 'auto' : 'calc(100dvh - 16px)',
                display: 'flex',
                flexDirection: app.isMobile ? 'column' : 'row',
                alignItems: 'stretch',
                gap: '0px',
                pointerEvents: 'auto',
                flex: '1 0 auto',
                flexShrink: 0,
              }}
            >
              <NavTabs
                activePage={app.activePage}
                onPageChange={app.handlePageChange}
                isMobile={app.isMobile}
                tabs={app.visibleTabPages}
                labelsById={app.t.tabs}
                openTabPrefix={app.t.openTabPrefix}
                tabSuffix={app.t.tabSuffix}
                unreadCount={safeUnreadCount}
              />

              <AppTabContent
                activePage={app.activePage}
                isMobile={app.isMobile}
                uiLanguage={app.uiLanguage}
                subtabShortcut={app.subtabShortcut}
                setReaderChapter={app.handleReaderChapterChange}
                isFinished={app.isFinished}
                trackExternalLink={app.trackExternalLink}
                cancelExternalLink={app.cancelExternalLink}
                markFinished={app.markFinished}
                unmarkFinished={app.unmarkFinished}
                getReadCount={app.getReadCount}
                incrementReadCount={app.incrementReadCount}
                getRemainingCooldown={app.getRemainingCooldown}
                pendingLinks={app.pendingLinks}
                finishedCount={app.finishedCount}
                finished={app.finished}
                readCounts={app.readCounts}
                reloadFromStorage={app.reloadFromStorage}
                syncData={app.syncData}
                accessibilityPrefs={app.accessibilityPrefs}
                readerPrefs={app.readerPrefs}
                setReaderPrefs={app.setReaderPrefs}
                handleMainTouchStart={app.handleMainTouchStart}
                handleMainTouchEnd={app.handleMainTouchEnd}
                setUiLanguage={app.setUiLanguage}
                toggleAccessibilityPref={app.toggleAccessibilityPref}
                setAccessibilityColorBlindMode={app.setAccessibilityColorBlindMode}
                shortcutStats={app.shortcutStats}
                t={app.t}
              />
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {app.deferredShellMount && (
        <Suspense fallback={null}>
          <ChangelogPopup isMobile={app.isMobile} uiLanguage={app.uiLanguage} />
        </Suspense>
      )}

      {app.deferredShellMount && (
        <Suspense fallback={null}>
          <BirthdayNotification isMobile={app.isMobile} uiLanguage={app.uiLanguage} />
        </Suspense>
      )}

      <div style={copyrightStyle}>© Takamatsu Misaki / KODANSHA</div>

      <AnimatePresence>
        {app.showScrollTop && !app.readerChapter && app.activePage !== 'blog' && app.activePage !== 'quiz' && (
          <motion.button
            key="scroll-top"
            className="app-tactile"
            onClick={app.scrollToTop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92, y: 4 }}
            style={{
              position: 'fixed',
              right: app.isMobile ? '16px' : '28px',
              bottom: app.isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 96px)' : '106px',
              zIndex: 1100,
              border: '3px solid #cbd5e1',
              borderBottom: '7px solid #94a3b8',
              background: '#fff',
              color: '#374151',
              borderRadius: '20px',
              padding: app.isMobile ? '14px' : '14px 20px',
              fontFamily: 'var(--font-hand)',
              fontWeight: 'bold',
              fontSize: app.isMobile ? '0.98rem' : '1.05rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: app.isMobile ? '0' : '6px',
            }}
          >
            <ChevronUp size={22} /> {!app.isMobile && app.t.returnToTop}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Settings control controls migrated natively to sidebar Settings tab */}

      <AnimatePresence>
        {app.readerChapter && app.readerChapter.pages && (
          <Suspense fallback={<ReaderOverlayFallback isMobile={app.isMobile} label={app.t.openingReader || 'Opening chapter...'} />}>
            <MangaReader
              key={`reader-${app.readerChapter.number}`}
              chapter={app.readerChapter}
              pages={app.readerChapter.pages}
              onClose={app.closeReader}
              onNextChapter={app.hasNextChapter ? app.handleNextChapter : undefined}
              onPrevChapter={app.hasPrevChapter ? app.handlePrevChapter : undefined}
              isMobile={app.isMobile}
              uiLanguage={app.uiLanguage}
              onChapterFinished={app.markFinished}
              getRemainingCooldown={app.getRemainingCooldown}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  </MotionConfig>
  );
};

export default AppChrome;
