import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';
import { APP_UI_TEXT } from '../../../config/appUiText';
import { registerHapticGesture } from '../../../utils/haptics';
import { useReadProgress } from '../../chapters/hooks/useReadProgress';
import { useSyncData } from '../../sync/hooks/useSyncData';
import { preloadChapterData, loadChapterData } from '../chapterDataLoader';
import { loadGalleryPage } from '../appPageLoaders';
import { loadMangaReader } from '../appLazyComponents';
import { createInitialCardPositions, createStickerLayoutById } from '../appDecorLayout';
import {
  ACCESSIBILITY_KEY,
  DEFAULT_PAGE,
  LANGUAGE_KEY,
  SHORTCUT_STATS_KEY,
  VALID_COLOR_BLIND_MODES,
  getVisibleTabPages,
} from '../appConstants';
import { getSupportedUiLanguages } from '../../../config/uiLanguage';
import {
  getInitialAccessibilityPrefs,
  getInitialActivePage,
  getInitialDisclaimerVisibility,
  getInitialReaderChapter,
  getInitialShortcutStats,
  getInitialUiLanguageValue,
  persistDisclaimerSeen,
} from '../appStorage';
import useDeferredMount from './useDeferredMount';
import { useGalleryPrefetch } from './useGalleryPrefetch';
import useIdlePreload from './useIdlePreload';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useMainScrollTop } from './useMainScrollTop';
import { usePageHistorySync } from './usePageHistorySync';
import { usePersistedAppState } from './usePersistedAppState';
import { useQuickPanels } from './useQuickPanels';
import { useReaderChapterNavigation } from './useReaderChapterNavigation';
import { useTabSwipeNavigation } from './useTabSwipeNavigation';
import { useUiBootDelay } from './useUiBootDelay';
import { useWindowSize } from './useWindowSize';

export const useAppController = () => {
  const {
    finished,
    finishedCount,
    readCounts,
    markFinished: rawMarkFinished,
    unmarkFinished,
    isFinished,
    getReadCount,
    incrementReadCount: rawIncrementReadCount,
    trackExternalLink,
    cancelExternalLink,
    reloadFromStorage,
    getRemainingCooldown,
    pendingLinks,
  } = useReadProgress();
  const syncData = useSyncData(reloadFromStorage);
  const { pushNow } = syncData;

  const markFinished = useCallback((chapter) => {
    rawMarkFinished(chapter);
    pushNow();
  }, [pushNow, rawMarkFinished]);

  const incrementReadCount = useCallback((chapter) => {
    rawIncrementReadCount(chapter);
    pushNow();
  }, [pushNow, rawIncrementReadCount]);

  const showUI = useUiBootDelay();
  const [showDisclaimer, setShowDisclaimer] = useState(getInitialDisclaimerVisibility);
  const closeDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
    persistDisclaimerSeen();
  }, []);

  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= 768;
  const stickerPositionsRef = useRef({});
  const [uiLanguage, setUiLanguage] = useState(getInitialUiLanguageValue);
  const visibleTabPages = useMemo(() => getVisibleTabPages(uiLanguage), [uiLanguage]);
  const [activePage, setActivePage] = useState(() => getInitialActivePage(visibleTabPages));
  const [readerChapter, setReaderChapter] = useState(getInitialReaderChapter);
  const quickControlsRef = useRef(null);
  const mainScrollRef = useRef(null);
  const [subtabShortcut, setSubtabShortcut] = useState({ key: null, token: 0 });
  const [shortcutStats, setShortcutStats] = useState(getInitialShortcutStats);
  const [accessibilityPrefs, setAccessibilityPrefs] = useState(getInitialAccessibilityPrefs);

  const t = APP_UI_TEXT[uiLanguage] || APP_UI_TEXT.en;
  const supportedUiLanguages = getSupportedUiLanguages();
  const displayActivePage = visibleTabPages.includes(activePage) ? activePage : (visibleTabPages[0] || DEFAULT_PAGE);
  const now = new Date();
  const showMitsumiReplayBanner = now.getMonth() === 2 && now.getDate() === 3;
  const deferredShellMount = useDeferredMount(showUI, 180);
  const showDecorativeLayer = deferredShellMount && !accessibilityPrefs.simplifyVisuals;

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
    activePage: displayActivePage,
    setActivePage,
    tabPages: visibleTabPages,
    readerChapter,
  });

  usePageHistorySync({ activePage: displayActivePage, setActivePage, tabPages: visibleTabPages });

  usePersistedAppState({
    activePage: displayActivePage,
    readerChapter,
    accessibilityPrefs,
    uiLanguage,
    shortcutStats,
    accessibilityKey: ACCESSIBILITY_KEY,
    languageKey: LANGUAGE_KEY,
    shortcutStatsKey: SHORTCUT_STATS_KEY,
  });

  useKeyboardShortcuts({
    activePage: displayActivePage,
    tabPages: visibleTabPages,
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

  useGalleryPrefetch({ activePage: displayActivePage, loadGalleryPage, enabled: uiLanguage !== 'ja' });
  useIdlePreload([loadMangaReader, preloadChapterData], !readerChapter && (displayActivePage === 'chapters' || displayActivePage === 'sync'), {
    delayMs: 420,
    staggerMs: 180,
    maxPreloadCount: isMobile ? 1 : 2,
  });

  useEffect(() => {
    if (displayActivePage === activePage) return;
    startTransition(() => {
      setActivePage(displayActivePage);
    });
  }, [activePage, displayActivePage]);

  useEffect(() => {
    if (supportedUiLanguages.includes(uiLanguage)) return;
    startTransition(() => {
      setUiLanguage('en');
    });
  }, [supportedUiLanguages, uiLanguage]);

  const toggleAccessibilityPref = useCallback((key) => {
    setAccessibilityPrefs((previous) => ({ ...previous, [key]: !previous[key] }));
  }, []);

  const setAccessibilityColorBlindMode = useCallback((mode) => {
    setAccessibilityPrefs((previous) => ({
      ...previous,
      colorBlindMode: VALID_COLOR_BLIND_MODES.includes(mode) ? mode : 'none',
    }));
  }, []);

  const { hasNextChapter, hasPrevChapter, handleNextChapter, handlePrevChapter } = useReaderChapterNavigation({
    readerChapter,
    setReaderChapter,
  });

  useEffect(() => {
    if (!readerChapter || Array.isArray(readerChapter.pages)) return undefined;

    let active = true;

    loadChapterData().then((chapters) => {
      if (!active) return;
      const hydratedChapter = chapters.find((chapter) => chapter.number === readerChapter.number);
      if (hydratedChapter) {
        setReaderChapter(hydratedChapter);
      }
    });

    return () => {
      active = false;
    };
  }, [readerChapter]);

  const handlePageChange = useCallback((nextPage) => {
    const normalizedPage = visibleTabPages.includes(nextPage)
      ? nextPage
      : (visibleTabPages[0] || DEFAULT_PAGE);
    startTransition(() => {
      setActivePage(normalizedPage);
    });
  }, [visibleTabPages]);

  const handleReaderChapterChange = useCallback((chapter) => {
    if (chapter?.number != null) {
      void preloadChapterData();
    }
    startTransition(() => {
      setReaderChapter(chapter);
    });
  }, []);

  const closeReader = useCallback(() => {
    setReaderChapter(null);
  }, []);

  const handlePositionUpdate = useCallback((id, position) => {
    stickerPositionsRef.current[id] = position;
  }, []);

  const [cardPositions] = useState(createInitialCardPositions);
  const [stickerLayoutById] = useState(createStickerLayoutById);

  return {
    accessibilityPrefs,
    activePage: displayActivePage,
    cancelExternalLink,
    cardPositions,
    closeDisclaimer,
    closeReader,
    deferredShellMount,
    finished,
    finishedCount,
    getReadCount,
    getRemainingCooldown,
    handleMainTouchEnd,
    handleMainTouchStart,
    handleNextChapter,
    handlePageChange,
    handlePositionUpdate,
    handlePrevChapter,
    handleReaderChapterChange,
    hasNextChapter,
    hasPrevChapter,
    incrementReadCount,
    isFinished,
    isMobile,
    mainScrollRef,
    markFinished,
    pendingLinks,
    quickControlsRef,
    readCounts,
    readerChapter,
    reloadFromStorage,
    scrollToTop,
    setAccessibilityColorBlindMode,
    setShowLanguageMenu,
    setUiLanguage,
    shortcutStats,
    showAccessibilityPanel,
    showDecorativeLayer,
    showDisclaimer,
    showLanguageMenu,
    showMitsumiReplayBanner,
    showScrollTop,
    showSettingsMain,
    showShortcutPanel,
    showUI,
    stickerLayoutById,
    stickerPositions: stickerPositionsRef.current,
    subtabShortcut,
    syncData,
    t,
    tabCount: visibleTabPages.length,
    visibleTabPages,
    toggleAccessibilityPanel,
    toggleAccessibilityPref,
    toggleLanguagePanel,
    toggleSettingsMain,
    toggleShortcutPanel,
    trackExternalLink,
    uiLanguage,
    unmarkFinished,
  };
};
