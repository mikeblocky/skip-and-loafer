/* eslint-disable no-unused-vars */
import { useState, useCallback, lazy, useRef, Suspense, useEffect, startTransition } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

// Data
import { CHARACTER_DATA } from './data/characters';
import { COVER_IMAGES } from './data/coverImages';
import { CHAPTERS } from './data/chapters';
import { UI_TEXT } from './config/uiText';

// Components
import NavTabs from './components/shared/NavTabs';
import AppTabContent from './features/app/AppTabContent';
import { loadGalleryPage } from './features/app/appPageLoaders';
import { useReadProgress } from './features/chapters/hooks/useReadProgress';
import { useSyncData } from './features/sync/hooks/useSyncData';
import { usePageHistorySync } from './features/app/hooks/usePageHistorySync';
import { useQuickPanels } from './features/app/hooks/useQuickPanels';
import { useTabSwipeNavigation } from './features/app/hooks/useTabSwipeNavigation';
import { useKeyboardShortcuts } from './features/app/hooks/useKeyboardShortcuts';
import { usePersistedAppState } from './features/app/hooks/usePersistedAppState';
import { useWindowSize } from './features/app/hooks/useWindowSize';
import { useMainScrollTop } from './features/app/hooks/useMainScrollTop';
import { useGalleryPrefetch } from './features/app/hooks/useGalleryPrefetch';
import { useReaderChapterNavigation } from './features/app/hooks/useReaderChapterNavigation';
import { useUiBootDelay } from './features/app/hooks/useUiBootDelay';
import useIdlePreload from './features/app/hooks/useIdlePreload';
import useDeferredMount from './features/app/hooks/useDeferredMount';
import { getInitialUiLanguage } from './config/uiLanguage';
import { registerHapticGesture } from './utils/haptics';

const loadMangaReader = () => import('./features/mangaReader/MangaReader');
const MangaReader = lazy(loadMangaReader);
const AppQuickControls = lazy(() => import('./features/app/AppQuickControls'));
const AppDisclaimerModal = lazy(() => import('./features/app/AppDisclaimerModal'));
const AppDecorativeLayer = lazy(() => import('./features/app/AppDecorativeLayer'));
const ChangelogPopup = lazy(() => import('./components/shared/ChangelogPopup'));
const BirthdayNotification = lazy(() => import('./components/shared/BirthdayNotification'));
const ACCESSIBILITY_KEY = 'skip_accessibilityPrefs_v1';
const LANGUAGE_KEY = 'skip_uiLanguage_v1';
const SHORTCUT_STATS_KEY = 'skip_shortcutStats_v1';
export const CHAT_FONT_FAMILY = "'Sniglet', 'Coming Soon', 'Pangolin', 'Comic Neue', 'Comic Sans MS', cursive";
const TAB_PAGES = ['home', 'chapters', 'gallery', 'blog', 'sync', 'quiz', 'birthdays', 'mystery', 'chat'];

const ReaderOverlayFallback = ({ isMobile, label }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1300,
      background: 'rgba(248, 250, 252, 0.82)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}
  >
    <div
      className="sketchbook-border"
      style={{
        width: isMobile ? 'min(88vw, 320px)' : '340px',
        borderRadius: '24px',
        border: '3px solid #bfdbfe',
        borderBottom: '8px solid #60a5fa',
        background: '#ffffff',
        padding: isMobile ? '18px 18px 20px' : '20px 22px 22px',
        boxShadow: '0 16px 32px rgba(148, 163, 184, 0.16)',
        display: 'grid',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '44%',
          height: '10px',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #dbeafe 0%, #93c5fd 50%, #dbeafe 100%)',
          backgroundSize: '200% 100%',
          animation: 'plannerShimmer 1.2s linear infinite',
        }}
      />
      <div style={{ width: '100%', height: '12px', borderRadius: '999px', background: '#e0f2fe' }} />
      <div style={{ width: '86%', height: '12px', borderRadius: '999px', background: '#e0f2fe' }} />
      <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '1rem' : '1.02rem', color: '#475569' }}>
        {label}
      </span>
    </div>
  </div>
);

function App() {
  const DISCLAIMER_SEEN_KEY = 'skip_disclaimerSeen_v1';
  const { finished, finishedCount, readCounts, markFinished: rawMarkFinished, unmarkFinished, isFinished, getReadCount, incrementReadCount: rawIncrementReadCount, trackExternalLink, cancelExternalLink, reloadFromStorage, getRemainingCooldown, pendingLinks } = useReadProgress();
  const syncData = useSyncData(reloadFromStorage);
  const { pushNow } = syncData;

  // Wrap markFinished and incrementReadCount to trigger an immediate sync push
  const markFinished = useCallback((ch) => { rawMarkFinished(ch); pushNow(); }, [rawMarkFinished, pushNow]);
  const incrementReadCount = useCallback((ch) => { rawIncrementReadCount(ch); pushNow(); }, [rawIncrementReadCount, pushNow]);

  const showUI = useUiBootDelay();
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    try {
      return localStorage.getItem(DISCLAIMER_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const closeDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
    try {
      localStorage.setItem(DISCLAIMER_SEEN_KEY, '1');
    } catch {
      // ignore storage failures
    }
  }, [DISCLAIMER_SEEN_KEY]);

  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= 768;
  const isNarrowMobile = windowSize.width <= 400;
  const stickerPositionsRef = useRef({});
  const [activePage, setActivePage] = useState(() => {
    const fallback = localStorage.getItem('skip_activePage') || 'home';
    if (typeof window === 'undefined') return fallback;

    const hashPage = window.location.hash.replace('#', '');
    if (TAB_PAGES.includes(hashPage)) return hashPage;
    return TAB_PAGES.includes(fallback) ? fallback : 'home';
  });
  const [readerChapter, setReaderChapter] = useState(() => {
    const saved = localStorage.getItem('skip_readerChapter');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const quickControlsRef = useRef(null);
  const mainScrollRef = useRef(null);
  const [subtabShortcut, setSubtabShortcut] = useState({ key: null, token: 0 });
  const [uiLanguage, setUiLanguage] = useState(() => {
    return getInitialUiLanguage(LANGUAGE_KEY);
  });
  const [shortcutStats, setShortcutStats] = useState(() => {
    try {
      const saved = localStorage.getItem(SHORTCUT_STATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          usageCount: Number(parsed.usageCount) || 0,
          coachSeen: !!parsed.coachSeen,
        };
      }
    } catch {
      // ignore malformed storage
    }

    return { usageCount: 0, coachSeen: false };
  });
  const [accessibilityPrefs, setAccessibilityPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(ACCESSIBILITY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          reduceMotion: !!parsed.reduceMotion,
          largeText: !!parsed.largeText,
          largeControls: !!parsed.largeControls,
          highContrast: !!parsed.highContrast,
          readableSpacing: !!parsed.readableSpacing,
          underlineLinks: !!parsed.underlineLinks,
          reduceTransparency: !!parsed.reduceTransparency,
          simplifyVisuals: !!parsed.simplifyVisuals,
          dimNonEssentialColors: !!parsed.dimNonEssentialColors,
          colorBlindMode: ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'black-white'].includes(parsed.colorBlindMode) ? parsed.colorBlindMode : 'none',
        };
      }
    } catch {
      // ignore malformed storage
    }

    return {
      reduceMotion: false,
      largeText: false,
      largeControls: false,
      highContrast: false,
      readableSpacing: false,
      underlineLinks: false,
      reduceTransparency: false,
      simplifyVisuals: false,
      dimNonEssentialColors: false,
      colorBlindMode: 'none',
    };
  });

  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const now = new Date();
  const showMitsumiReplayBanner = now.getMonth() === 2 && now.getDate() === 3;
  const deferredShellMount = useDeferredMount(showUI, 180);
  const showDecorativeLayer =
    deferredShellMount &&
    !accessibilityPrefs.simplifyVisuals;

  const {
    showAccessibilityPanel,
    showShortcutPanel,
    showLanguageMenu,
    showSettingsMain,
    setShowLanguageMenu,
    toggleAccessibilityPanel,
    toggleShortcutPanel,
    toggleLanguagePanel,
    toggleSettingsMain,
    closeAllPanels,
  } = useQuickPanels({ quickControlsRef, shortcutStats, setShortcutStats });

  const { handleMainTouchStart, handleMainTouchEnd } = useTabSwipeNavigation({
    activePage,
    setActivePage,
    tabPages: TAB_PAGES,
    readerChapter,
  });

  usePageHistorySync({ activePage, setActivePage, tabPages: TAB_PAGES });

  usePersistedAppState({
    activePage,
    readerChapter,
    accessibilityPrefs,
    uiLanguage,
    shortcutStats,
    accessibilityKey: ACCESSIBILITY_KEY,
    languageKey: LANGUAGE_KEY,
    shortcutStatsKey: SHORTCUT_STATS_KEY,
  });

  useKeyboardShortcuts({
    activePage,
    tabPages: TAB_PAGES,
    setActivePage,
    setSubtabShortcut,
    toggleAccessibilityPanel,
    toggleShortcutPanel,
    setShortcutStats,
    closeAllPanels,
  });

  const { showScrollTop, scrollToTop } = useMainScrollTop({ mainScrollRef, showUI });

  useEffect(() => {
    const interactiveSelector = 'button, [role="button"], a[href], input[type="button"], input[type="submit"], input[type="reset"]';

    const handlePointerDown = (event) => {
      if (event.pointerType && event.pointerType !== 'touch') return;
      const target = event.target?.closest?.(interactiveSelector);
      if (!target) return;
      if (target.disabled || target.getAttribute('aria-disabled') === 'true' || target.getAttribute('data-no-haptic') === '1') return;
      registerHapticGesture();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, []);

  useGalleryPrefetch({ activePage, loadGalleryPage });
  useIdlePreload([loadMangaReader], !readerChapter && (activePage === 'chapters' || activePage === 'sync'), {
    delayMs: 420,
    staggerMs: 180,
    maxPreloadCount: 1,
  });

  const toggleAccessibilityPref = useCallback((key) => {
    setAccessibilityPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setAccessibilityColorBlindMode = useCallback((mode) => {
    setAccessibilityPrefs((prev) => ({
      ...prev,
      colorBlindMode: ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'black-white'].includes(mode) ? mode : 'none',
    }));
  }, []);

  const { hasNextChapter, hasPrevChapter, handleNextChapter, handlePrevChapter } = useReaderChapterNavigation({
    chapters: CHAPTERS,
    readerChapter,
    setReaderChapter,
  });

  const handlePageChange = useCallback((nextPage) => {
    startTransition(() => {
      setActivePage(nextPage);
    });
  }, []);

  const handleReaderChapterChange = useCallback((chapter) => {
    startTransition(() => {
      setReaderChapter(chapter);
    });
  }, []);

  const handlePositionUpdate = useCallback((id, pos) => {
    stickerPositionsRef.current[id] = pos;
  }, []);

  const [cardPositions] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return COVER_IMAGES.map(() => ({
      x: Math.random() * (w - 220),
      y: Math.random() * (h - 180),
      rotation: Math.random() * 20 - 10
    }));
  });

  const [stickerLayoutById] = useState(() => {
    const ids = CHARACTER_DATA.map(char => char.id);
    const shuffled = [...ids];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const splitIndex = Math.ceil(shuffled.length / 2);
    const leftIds = shuffled.slice(0, splitIndex);
    const rightIds = shuffled.slice(splitIndex);

    const layout = {};
    leftIds.forEach((id, idx) => {
      layout[id] = { side: 'left', rank: idx, count: leftIds.length };
    });
    rightIds.forEach((id, idx) => {
      layout[id] = { side: 'right', rank: idx, count: rightIds.length };
    });

    return layout;
  });

  return (
    <MotionConfig reducedMotion={accessibilityPrefs.reduceMotion ? 'always' : 'never'}>
      <div style={{ minHeight: '100dvh', height: '100dvh', width: '100%', position: 'relative', overflowX: 'hidden', overflowY: 'visible' }}>
        <a
          href="#main-content"
          style={{
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
          }}
          onFocus={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.transform = 'translateY(-180%)';
          }}
        >
          {t.skipToContent}
        </a>

      {showDisclaimer && deferredShellMount && (
        <Suspense fallback={null}>
          <AppDisclaimerModal showDisclaimer={showDisclaimer} onClose={closeDisclaimer} />
        </Suspense>
      )}

      {showDecorativeLayer && (
        <Suspense fallback={null}>
          <AppDecorativeLayer
            accessibilityPrefs={accessibilityPrefs}
            isMobile={isMobile}
            activePage={activePage}
            handlePositionUpdate={handlePositionUpdate}
            stickerPositions={stickerPositionsRef.current}
            stickerLayoutById={stickerLayoutById}
            cardPositions={cardPositions}
          />
        </Suspense>
      )}

      {/* Main UI */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            ref={mainScrollRef}
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
              padding: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 58px) 0 calc(env(safe-area-inset-bottom, 0px) + 72px) 0' : '22px 18px 16px',
              pointerEvents: 'auto'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {showMitsumiReplayBanner && (
              <motion.a
                href="/mitsumi"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: isMobile ? '4px' : '8px',
                  marginBottom: isMobile ? '8px' : '10px',
                  padding: isMobile ? '8px 12px' : '10px 14px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-hand)',
                  fontSize: isMobile ? '0.85rem' : '0.92rem',
                  fontWeight: 'bold',
                  color: '#be185d',
                  background: '#fdf2f8',
                  border: '2px solid #f9a8d4',
                  boxShadow: '0 4px 10px rgba(244,114,182,0.18)',
                  zIndex: 900,
                }}
              >
                Replay Mitsumi's birthday surprise!
              </motion.a>
            )}

            {/* Spacer for safe centering */}
            <div style={{ flexGrow: isMobile ? 0 : 1, minHeight: isMobile ? '0' : '6px' }} />

            {/* Container to handle stacking contexts for tabs and planner */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: 'easeOut', delay: 0.01 }}
              style={{
                position: 'relative',
                scrollMarginTop: '60px',
                width: '100%',
                maxWidth: isMobile ? '100%' : (activePage === 'home' ? (accessibilityPrefs.largeText ? '1200px' : '1140px') : '1210px'),
                minHeight: isMobile ? 'calc(100dvh - 160px)' : '800px',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'auto',
                flex: '1 0 auto',
                flexShrink: 0,
            }}>
              {/* Bookmark Nav Tabs */}
              <NavTabs
                activePage={activePage}
                onPageChange={handlePageChange}
                isMobile={isMobile}
                labelsById={t.tabs}
                openTabPrefix={t.openTabPrefix}
                tabSuffix={t.tabSuffix}
              />

              <AppTabContent
                activePage={activePage}
                isMobile={isMobile}
                uiLanguage={uiLanguage}
                subtabShortcut={subtabShortcut}
                setReaderChapter={handleReaderChapterChange}
                isFinished={isFinished}
                trackExternalLink={trackExternalLink}
                cancelExternalLink={cancelExternalLink}
                markFinished={markFinished}
                unmarkFinished={unmarkFinished}
                getReadCount={getReadCount}
                incrementReadCount={incrementReadCount}
                getRemainingCooldown={getRemainingCooldown}
                pendingLinks={pendingLinks}
                finishedCount={finishedCount}
                finished={finished}
                readCounts={readCounts}
                reloadFromStorage={reloadFromStorage}
                syncData={syncData}
                accessibilityPrefs={accessibilityPrefs}
                handleMainTouchStart={handleMainTouchStart}
                handleMainTouchEnd={handleMainTouchEnd}
              />
            </motion.div>

            {/* Spacer for safe centering */}
            <div style={{ flexGrow: isMobile ? 0 : 1, minHeight: isMobile ? '0' : '8px' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Changelog Popup */}
      {deferredShellMount && (
        <Suspense fallback={null}>
          <ChangelogPopup isMobile={isMobile} uiLanguage={uiLanguage} />
        </Suspense>
      )}

      {/* Birthday Notification */}
      {deferredShellMount && (
        <Suspense fallback={null}>
          <BirthdayNotification isMobile={isMobile} uiLanguage={uiLanguage} />
        </Suspense>
      )}

      {/* Copyright */}
      <div style={{ position: 'fixed', bottom: '8px', right: '14px', zIndex: 1000, fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '0.7rem', opacity: 0.6 }}>
        © Takamatsu Misaki / KODANSHA
      </div>

      {/* Global Scroll-to-Top Button */}
      <AnimatePresence>
        {showScrollTop && !readerChapter && activePage !== 'blog' && activePage !== 'quiz' && activePage !== 'chat' && (
          <motion.button
            key="scroll-top"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92, y: 4 }}
            style={{
              position: 'fixed',
              right: isMobile ? '16px' : '28px',
              bottom: isMobile ? '96px' : '106px',
              zIndex: 1100,
              border: '3px solid #cbd5e1',
              borderBottom: '7px solid #94a3b8',
              background: '#fff',
              color: '#374151',
              borderRadius: '20px',
              padding: isMobile ? '14px' : '14px 20px',
              fontFamily: 'var(--font-hand)',
              fontWeight: 'bold',
              fontSize: isMobile ? '0.98rem' : '1.05rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '0' : '6px',
            }}
          >
            <ChevronUp size={isMobile ? 22 : 22} /> {!isMobile && t.returnToTop}
          </motion.button>
        )}
      </AnimatePresence>

      {deferredShellMount && (
        <Suspense fallback={null}>
          <AppQuickControls
            quickControlsRef={quickControlsRef}
            readerChapter={readerChapter}
            isMobile={isMobile}
            t={t}
            uiText={UI_TEXT}
            showAccessibilityPanel={showAccessibilityPanel}
            showShortcutPanel={showShortcutPanel}
            showLanguageMenu={showLanguageMenu}
            showSettingsMain={showSettingsMain}
            toggleAccessibilityPanel={toggleAccessibilityPanel}
            toggleShortcutPanel={toggleShortcutPanel}
            toggleLanguagePanel={toggleLanguagePanel}
            toggleSettingsMain={toggleSettingsMain}
            accessibilityPrefs={accessibilityPrefs}
            toggleAccessibilityPref={toggleAccessibilityPref}
            setAccessibilityColorBlindMode={setAccessibilityColorBlindMode}
            uiLanguage={uiLanguage}
            setUiLanguage={setUiLanguage}
            setShowLanguageMenu={setShowLanguageMenu}
            shortcutStats={shortcutStats}
            tabCount={TAB_PAGES.length}
          />
        </Suspense>
      )}

      {/* Manga Reader Overlay */}
      <AnimatePresence>
          {readerChapter && readerChapter.pages && (
            <Suspense fallback={<ReaderOverlayFallback isMobile={isMobile} label={t.openingReader || 'Opening chapter...'} />}>
              <MangaReader
              key={`reader-${readerChapter.number}`}
              chapter={readerChapter}
              pages={readerChapter.pages}
              onClose={() => setReaderChapter(null)}
              onNextChapter={hasNextChapter ? handleNextChapter : undefined}
              onPrevChapter={hasPrevChapter ? handlePrevChapter : undefined}
              isMobile={isMobile}
              uiLanguage={uiLanguage}
              onChapterFinished={markFinished}
              getRemainingCooldown={getRemainingCooldown}
            />
          </Suspense>
        )}
      </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

export default App;
