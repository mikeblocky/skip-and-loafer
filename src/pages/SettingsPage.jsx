import { useState, useEffect, useRef, useCallback } from 'react';
import PageLayout from '../components/shared/paper/PageLayout';
import { Accessibility, Keyboard, Languages, Settings, Sparkle, Sun, Moon, FileText as FileTextIcon, ALargeSmall, Space, Focus, Zap, Download, CheckCircle, Smartphone, WifiOff, RefreshCw, Trash2, Clock3, MousePointerClick, Route, Trophy, Camera, HardDriveDownload, Share2, Bell, UploadCloud, Type, Maximize2, AlignJustify, Link, Contrast, Layers, CircleOff, WandSparkles, Palette, Globe2, Home, ArrowLeftRight } from 'lucide-react';
import { getLanguageOptions, UI } from '../i18n/ui';
import { OFFLINE_ASSET_GROUPS, OFFLINE_PUBLIC_ASSETS, getOfflineAssetGroup } from '../data/offlineAssets.js';
import { PAPER_FONT_FAMILY } from '../components/shared/paper/paperTheme';
import PaperPageHeader from '../components/shared/paper/PaperPageHeader';
import PaperHeadingBadge from '../components/shared/paper/PaperHeadingBadge';
import {
  SettingsChoiceRow,
  SettingsDropdown,
  SettingsRow,
  SettingsToggleRow,
} from '../features/settings/SettingsControls.jsx';
import {
  PANEL_TITLE_STYLE,
  getPanelIconBoxStyle,
} from '../features/settings/settingsStyles.js';
import { getThemedCameraEnabled, setThemedCameraEnabled } from '../features/stickerCam/themedCameraPreference';
import { getReleasedChapterNotification } from '../data/chapterReleaseInfo.js';
import {
  INSTALL_PROMPT_READY_EVENT,
  OFFLINE_LIBRARY_ENABLED_KEY,
  PWA_SYNC_COMPLETE_EVENT,
  PWA_SYNC_IDLE_EVENT,
  PWA_UPDATE_APPLY_EVENT,
  PWA_UPDATE_READY_EVENT,
} from '../utils/pwaEvents.js';
import { flushPendingRequests, getPendingOfflineRequestCount } from '../utils/offlineSync.js';
import {
  PERFORMANCE_MODE_CHANGE_EVENT,
  getDevicePerformanceSnapshot,
  readPerformanceModePreference,
  resolvePerformanceMode,
  writePerformanceModePreference,
} from '../utils/performanceMode.js';

const getSavedInstallPrompt = () => window.__skipInstallPromptEvent || null;
const OFFLINE_PUBLIC_ASSET_PATHS = new Set(OFFLINE_PUBLIC_ASSETS);

const getOfflinePublicAssetPath = (request) => {
  try {
    const pathname = new URL(request.url).pathname;
    if (OFFLINE_PUBLIC_ASSET_PATHS.has(pathname)) return pathname;
    const decodedPathname = decodeURIComponent(pathname);
    return OFFLINE_PUBLIC_ASSET_PATHS.has(decodedPathname) ? decodedPathname : null;
  } catch {
    return null;
  }
};

const SettingsPage = ({
  isMobile,
  uiLanguage,
  setUiLanguage,
  accessibilityPrefs,
  toggleAccessibilityPref,
  setAccessibilityColorBlindMode,
  readerPrefs,
  setReaderPrefs,
  t,
  siteStats,
  outerSwitcher,
}) => {
  const fallbackText = UI.en;

  const installPromptRef = useRef(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [offlineStatus, setOfflineStatus] = useState({
    cached: 0,
    processed: 0,
    total: OFFLINE_PUBLIC_ASSETS.length,
    preparing: false,
  });
  const [offlineGroupKey, setOfflineGroupKey] = useState('all');
  const [storageEstimate, setStorageEstimate] = useState(null);
  // Per-group cached file count + byte size, keyed by group.key. Populated by
  // refreshGroupStats (heavier than the count refresh, so it runs less often).
  const [cacheGroupStats, setCacheGroupStats] = useState({});
  const [deletingGroupKey, setDeletingGroupKey] = useState('');
  const [isClearingOfflineCache, setIsClearingOfflineCache] = useState(false);
  const [persistentStorage, setPersistentStorage] = useState({
    supported: typeof navigator !== 'undefined' && !!navigator.storage?.persist,
    persisted: false,
    requesting: false,
  });
  const [updateReady, setUpdateReady] = useState(typeof window !== 'undefined' && !!window.__skipWaitingServiceWorker);
  const [canShareApp, setCanShareApp] = useState(typeof navigator !== 'undefined' && !!navigator.share);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );
  const [notificationTestStatus, setNotificationTestStatus] = useState('');
  const [pendingOfflineActions, setPendingOfflineActions] = useState(() => getPendingOfflineRequestCount());
  const [performancePreference, setPerformancePreference] = useState(readPerformanceModePreference);
  const [performanceSnapshot, setPerformanceSnapshot] = useState(getDevicePerformanceSnapshot);
  const [keepPreparingOffline, setKeepPreparingOffline] = useState(() => {
    try {
      return localStorage.getItem(OFFLINE_LIBRARY_ENABLED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [themedCamera, setThemedCamera] = useState(() => getThemedCameraEnabled());

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    installPromptRef.current = getSavedInstallPrompt();
    setCanInstall(!!installPromptRef.current);

    const syncSavedPrompt = () => {
      installPromptRef.current = getSavedInstallPrompt();
      setCanInstall(!!installPromptRef.current);
    };

    const handler = (e) => {
      e.preventDefault();
      installPromptRef.current = e;
      window.__skipInstallPromptEvent = e;
      setCanInstall(true);
    };
    const handleInstalled = () => {
      window.__skipInstallPromptEvent = null;
      installPromptRef.current = null;
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener(INSTALL_PROMPT_READY_EVENT, syncSavedPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener(INSTALL_PROMPT_READY_EVENT, syncSavedPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refreshPersistence = async () => {
      if (!navigator.storage?.persisted) return;
      try {
        const persisted = await navigator.storage.persisted();
        if (!cancelled) {
          setPersistentStorage((previous) => ({ ...previous, supported: true, persisted }));
        }
      } catch {
        // Persistence can be hidden by private browsing or older browser modes.
      }
    };

    const handleUpdateReady = () => setUpdateReady(true);
    const refreshPendingActions = () => setPendingOfflineActions(getPendingOfflineRequestCount());

    refreshPersistence();
    setCanShareApp(!!navigator.share);
    window.addEventListener(PWA_UPDATE_READY_EVENT, handleUpdateReady);
    window.addEventListener('online', refreshPendingActions);
    window.addEventListener('focus', refreshPendingActions);
    window.addEventListener(PWA_SYNC_COMPLETE_EVENT, refreshPendingActions);
    window.addEventListener(PWA_SYNC_IDLE_EVENT, refreshPendingActions);

    return () => {
      cancelled = true;
      window.removeEventListener(PWA_UPDATE_READY_EVENT, handleUpdateReady);
      window.removeEventListener('online', refreshPendingActions);
      window.removeEventListener('focus', refreshPendingActions);
      window.removeEventListener(PWA_SYNC_COMPLETE_EVENT, refreshPendingActions);
      window.removeEventListener(PWA_SYNC_IDLE_EVENT, refreshPendingActions);
    };
  }, []);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    const refreshPerformanceSnapshot = () => setPerformanceSnapshot(getDevicePerformanceSnapshot());
    const handlePerformancePreference = (event) => {
      setPerformancePreference(event.detail?.value || readPerformanceModePreference());
      refreshPerformanceSnapshot();
    };

    window.addEventListener(PERFORMANCE_MODE_CHANGE_EVENT, handlePerformancePreference);
    connection?.addEventListener?.('change', refreshPerformanceSnapshot);

    return () => {
      window.removeEventListener(PERFORMANCE_MODE_CHANGE_EVENT, handlePerformancePreference);
      connection?.removeEventListener?.('change', refreshPerformanceSnapshot);
    };
  }, []);

  const refreshGroupStats = useCallback(async () => {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      const cacheNames = (await caches.keys()).filter((name) => name.startsWith('skip-offline-'));
      // Map every cached offline asset to its byte size once (deduped across caches).
      const pathBytes = new Map();
      await Promise.all(cacheNames.map(async (cacheName) => {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        await Promise.all(requests.map(async (request) => {
          const path = getOfflinePublicAssetPath(request);
          if (!path || pathBytes.has(path)) return;
          try {
            const response = await cache.match(request);
            if (!response) return;
            const declared = Number(response.headers.get('content-length'));
            let bytes = Number.isFinite(declared) && declared > 0 ? declared : 0;
            if (!bytes) bytes = (await response.clone().blob()).size;
            pathBytes.set(path, bytes);
          } catch {
            pathBytes.set(path, 0);
          }
        }));
      }));

      const stats = {};
      for (const group of OFFLINE_ASSET_GROUPS) {
        let count = 0;
        let bytes = 0;
        for (const path of group.getAssets()) {
          const size = pathBytes.get(path);
          if (size !== undefined) {
            count += 1;
            bytes += size;
          }
        }
        stats[group.key] = { count, bytes };
      }
      setCacheGroupStats(stats);
    } catch {
      // Cache API can be unavailable in private browsing; leave the last known stats.
    }
  }, []);

  useEffect(() => {
    refreshGroupStats();
    const handleRefresh = () => refreshGroupStats();
    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);
    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [refreshGroupStats]);

  useEffect(() => {
    const refreshStorageStatus = async () => {
      try {
        const activeAssets = getOfflineAssetGroup(offlineGroupKey).getAssets();
        const activeAssetPaths = new Set(activeAssets);
        if ('storage' in navigator && typeof navigator.storage.estimate === 'function') {
          setStorageEstimate(await navigator.storage.estimate());
        }

        if ('caches' in window) {
          const cacheNames = await caches.keys();
          const offlineCacheNames = cacheNames.filter((name) => name.startsWith('skip-offline-'));
          const cachedAssets = new Set();
          const cachedPathLists = await Promise.all(
            offlineCacheNames.map(async (cacheName) => {
              const cache = await caches.open(cacheName);
              const requests = await cache.keys();
              return requests.map(getOfflinePublicAssetPath).filter(Boolean);
            }),
          );
          cachedPathLists.flat().forEach((path) => cachedAssets.add(path));
          const cached = activeAssets.filter((path) => cachedAssets.has(path)).length;
          setOfflineStatus((previous) => ({
            ...previous,
            cached: Math.min(cached, activeAssetPaths.size),
            total: activeAssets.length,
          }));
        }
      } catch {
        // Browser storage APIs can be unavailable in private browsing.
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === 'SKIP_OFFLINE_CACHE_PROGRESS') {
        setOfflineStatus((previous) => ({
          ...previous,
          cached: Math.min(
            Number(event.data.cached || previous.cached || 0),
            Number(event.data.total || previous.total || OFFLINE_PUBLIC_ASSETS.length),
          ),
          processed: Number(event.data.processed || previous.processed || 0),
          total: Number(event.data.total || previous.total || OFFLINE_PUBLIC_ASSETS.length),
          preparing: true,
        }));
        return;
      }

      if (event.data?.type === 'SKIP_OFFLINE_CACHE_CLEARED') {
        setIsClearingOfflineCache(false);
        setOfflineStatus((previous) => ({
          ...previous,
          cached: 0,
          processed: 0,
          preparing: false,
        }));
        refreshStorageStatus();
        refreshGroupStats();
        return;
      }

      if (event.data?.type !== 'SKIP_OFFLINE_CACHE_COMPLETE') return;
      const completedTotal = Number(event.data.total || OFFLINE_PUBLIC_ASSETS.length);
      setOfflineStatus({
        cached: Math.min(Number(event.data.cached || 0), completedTotal),
        processed: completedTotal,
        total: completedTotal,
        preparing: false,
      });
      refreshStorageStatus();
      refreshGroupStats();
    };

    refreshStorageStatus();
    const refreshIntervalId = window.setInterval(refreshStorageStatus, 1800);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', refreshStorageStatus);
    document.addEventListener('visibilitychange', refreshStorageStatus);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      window.clearInterval(refreshIntervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', refreshStorageStatus);
      document.removeEventListener('visibilitychange', refreshStorageStatus);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [offlineGroupKey, refreshGroupStats]);

  const handleInstall = async () => {
    const promptEvent = installPromptRef.current || getSavedInstallPrompt();
    if (!promptEvent) return;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') { setIsInstalled(true); setCanInstall(false); }
    installPromptRef.current = null;
    window.__skipInstallPromptEvent = null;
    setCanInstall(false);
  };

  const handleApplyUpdate = () => {
    window.dispatchEvent(new CustomEvent(PWA_UPDATE_APPLY_EVENT));
  };

  const handleRequestPersistentStorage = async () => {
    if (!navigator.storage?.persist) return;
    setPersistentStorage((previous) => ({ ...previous, requesting: true }));
    try {
      const persisted = await navigator.storage.persist();
      setPersistentStorage((previous) => ({ ...previous, persisted, requesting: false }));
      if ('storage' in navigator && typeof navigator.storage.estimate === 'function') {
        setStorageEstimate(await navigator.storage.estimate());
      }
    } catch {
      setPersistentStorage((previous) => ({ ...previous, requesting: false }));
    }
  };

  const handleShareApp = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: 'Skip and Loafer',
        text: 'Open the Skip and Loafer fan app.',
        url: window.location.origin,
      });
    } catch {
      // Share sheets throw when users cancel; no need to show an error.
    }
  };

  const showChapterNotification = async ({ prefix = '' } = {}) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;
    const notification = getReleasedChapterNotification();
    const options = {
      body: `${prefix}${notification.body}`,
      icon: '/swt2-512.png',
      badge: '/swt2-512.png',
      tag: `${notification.tag}-settings-test`,
      data: { url: '/#chapters' },
    };

    try {
      const registration = await navigator.serviceWorker?.ready?.catch(() => null);
      if (registration?.showNotification) {
        await registration.showNotification(notification.title, options);
      } else {
        new Notification(notification.title, options);
      }
      setNotificationTestStatus('Sent');
      return true;
    } catch {
      setNotificationTestStatus('Blocked');
      return false;
    }
  };

  const handleRequestNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      await showChapterNotification({ prefix: 'Chapter alerts are ready. ' });
    }
  };

  const handleTestChapterNotification = async () => {
    setNotificationTestStatus('Sending');
    await showChapterNotification();
  };

  const handleFlushPendingActions = async () => {
    await flushPendingRequests();
    setPendingOfflineActions(getPendingOfflineRequestCount());
  };

  const handlePerformancePreferenceChange = (value) => {
    setPerformancePreference(writePerformanceModePreference(value));
    setPerformanceSnapshot(getDevicePerformanceSnapshot());
  };

  const handlePrepareOffline = async ({ persist = true, groupKey = offlineGroupKey } = {}) => {
    if (!navigator.serviceWorker?.controller && !navigator.serviceWorker?.ready) return;
    const assetGroup = getOfflineAssetGroup(groupKey);
    const assets = assetGroup.getAssets();
    setOfflineGroupKey(assetGroup.key);
    if (persist) {
      try {
        localStorage.setItem(OFFLINE_LIBRARY_ENABLED_KEY, '1');
      } catch {
        // Ignore storage failures; this run can still continue.
      }
      setKeepPreparingOffline(true);
    }
    setOfflineStatus((previous) => ({
      ...previous,
      processed: 0,
      preparing: true,
      total: assets.length,
    }));

    const registration = await navigator.serviceWorker.ready.catch(() => null);
    const worker = registration?.active || navigator.serviceWorker.controller;
    if (!worker) {
      setOfflineStatus((previous) => ({ ...previous, preparing: false }));
      return;
    }

    worker.postMessage({
      type: 'SKIP_CACHE_OFFLINE_ASSETS',
      assets,
    });
  };

  const handleKeepPreparingChange = (enabled) => {
    setKeepPreparingOffline(enabled);
    try {
      if (enabled) {
        localStorage.setItem(OFFLINE_LIBRARY_ENABLED_KEY, '1');
        handlePrepareOffline({ persist: false, groupKey: 'all' });
      } else {
        localStorage.removeItem(OFFLINE_LIBRARY_ENABLED_KEY);
      }
    } catch {
      // Ignore storage failures.
    }
  };

  const handleDeleteGroup = async (groupKey) => {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    const group = getOfflineAssetGroup(groupKey);
    // Deleting "Everything" is the same as clearing the whole offline cache.
    if (group.key === 'all') {
      await handleClearOfflineCache();
      return;
    }

    const assetSet = new Set(group.getAssets());
    setDeletingGroupKey(group.key);
    try {
      const cacheNames = (await caches.keys()).filter((name) => name.startsWith('skip-offline-'));
      await Promise.all(cacheNames.map(async (cacheName) => {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        await Promise.all(requests.map(async (request) => {
          const path = getOfflinePublicAssetPath(request);
          if (path && assetSet.has(path)) await cache.delete(request);
        }));
      }));
    } catch {
      // Ignore Cache API failures; partial deletes still free space.
    }
    setDeletingGroupKey('');
    await refreshGroupStats();
  };

  const handleClearOfflineCache = async () => {
    setIsClearingOfflineCache(true);
    setKeepPreparingOffline(false);
    try {
      localStorage.removeItem(OFFLINE_LIBRARY_ENABLED_KEY);
    } catch {
      // Ignore storage failures.
    }

    const registration = await navigator.serviceWorker?.ready.catch(() => null);
    const worker = registration?.active || navigator.serviceWorker?.controller;

    if (worker) {
      worker.postMessage({ type: 'SKIP_CLEAR_OFFLINE_CACHE' });
      return;
    }

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.filter((name) => name.startsWith('skip-offline-')).map((name) => caches.delete(name)));
      }
    } catch {
      // Ignore cache API failures.
    }

    setOfflineStatus((previous) => ({
      ...previous,
      cached: 0,
      processed: 0,
      preparing: false,
    }));
    setIsClearingOfflineCache(false);
  };

  const formatBytes = (value) => {
    if (!Number.isFinite(value) || value <= 0) return '0 MB';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = value;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${size >= 10 || unitIndex === 0 ? Math.round(size) : size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDuration = (ms = 0) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const pageLabels = {
    home: 'Planner',
    chapters: 'Chapters',
    gallery: 'Gallery',
    community: 'Community',
    blog: 'Blog',
    wiki: 'Wiki',
    quiz: 'Quiz',
    birthdays: 'Birthdays',
    mystery: 'Mystery',
    settings: 'Settings',
    stickerCam: 'Sticker cam',
  };

  const usageStats = siteStats || {};
  const pageEntries = Object.entries(usageStats.pages || {});
  const favoritePage = pageEntries
    .sort(([, left], [, right]) => (right.timeMs || 0) - (left.timeMs || 0))[0];
  const favoritePageName = favoritePage ? (pageLabels[favoritePage[0]] || favoritePage[0]) : 'None yet';
  const usageRoast = usageStats.totalTimeMs > 3600000
    ? 'You have spent over an hour here total.'
    : usageStats.totalTimeMs > 600000
      ? 'You have spent more than 10 minutes here across your visits.'
      : 'You are new here. No usage history yet to speak of.';

  const offlineProgress = Math.max(
    0,
    Math.min(100, Math.round((offlineStatus.cached / Math.max(1, offlineStatus.total)) * 100)),
  );
  const displayedOfflineCached = Math.min(offlineStatus.cached, offlineStatus.total);
  const selectedOfflineGroup = getOfflineAssetGroup(offlineGroupKey);
  const resolvedPerformanceMode = resolvePerformanceMode(performancePreference, performanceSnapshot);
  const performanceReasonLabel = {
    'save-data': 'Save-Data is on',
    'slow-2g': 'very slow connection',
    '2g': 'slow connection',
    '3g': 'mobile connection',
    memory: 'limited memory',
    cpu: 'mobile CPU',
    comfortable: 'comfortable device',
    unknown: 'device check unavailable',
  }[performanceSnapshot.reason] || performanceSnapshot.reason;
  const performanceModeOptions = [
    {
      key: 'auto',
      label: 'Auto',
      detail: performanceSnapshot.constrained ? `Efficiency because of ${performanceReasonLabel}.` : 'Full mode on this device.',
    },
    { key: 'efficient', label: 'Efficiency', detail: 'Less preloading and fewer decorative layers.' },
    { key: 'full', label: 'Full', detail: 'Richer visuals and warmer preloading.' },
  ];

  const appLanguageOptions = getLanguageOptions();
  const languageDetails = {
    en: 'Use the original English interface text.',
    es: 'Switch menus and labels to Spanish.',
    pt: 'Switch menus and labels to Brazilian Portuguese.',
    fr: 'Switch menus and labels to French.',
    de: 'Switch menus and labels to German.',
    it: 'Switch menus and labels to Italian.',
    ja: 'Switch menus and labels to Japanese.',
  };
  const colorBlindLabel = t.colorVisionMode || fallbackText.colorVisionMode || 'Color vision mode';

  const colorBlindOptions = [
    { key: 'none', label: t.colorVisionOff || fallbackText.colorVisionOff || 'Off', detail: 'Keep the original app colors unchanged.' },
    { key: 'protanopia', label: t.colorVisionProtanopia || fallbackText.colorVisionProtanopia || 'Protanopia', detail: 'Reduce red-green reliance for red-light sensitivity.' },
    { key: 'deuteranopia', label: t.colorVisionDeuteranopia || fallbackText.colorVisionDeuteranopia || 'Deuteranopia', detail: 'Separate green-heavy UI cues with safer contrast.' },
    { key: 'tritanopia', label: t.colorVisionTritanopia || fallbackText.colorVisionTritanopia || 'Tritanopia', detail: 'Adjust blue-yellow cues so controls remain distinct.' },
    { key: 'black-white', label: t.colorVisionBlackWhite || fallbackText.colorVisionBlackWhite || 'Black & White', detail: 'Remove hue dependence and keep meaning in contrast.' },
  ];

  const shortcutRows = [
    { keyLabel: '1-9, 0', description: t.mainTabShortcut || fallbackText.mainTabShortcut || 'Jump to a main tab', detail: '1 opens the first visible tab, 2 opens the second, and 0 opens the tenth. Hidden tabs are skipped.', icon: Home },
    { keyLabel: 'Q / E', description: t.prevNextSubtab || fallbackText.prevNextSubtab || 'Previous / next subtab', detail: 'Works inside Chapters, Gallery, and Reading/Sync sub-tabs.', icon: ArrowLeftRight },
  ];

  const accessibilityOptions = [
    { key: 'largeText', label: t.largeText || fallbackText.largeText, detail: 'Increase body and control text for easier reading.' },
    { key: 'largeControls', label: t.largeControls || fallbackText.largeControls, detail: 'Make tap targets roomier across the app.' },
    { key: 'readableSpacing', label: t.readableSpacing || fallbackText.readableSpacing, detail: 'Add breathing room between lines and paragraphs.' },
    { key: 'underlineLinks', label: t.underlineLinks || fallbackText.underlineLinks, detail: 'Underline links so they are easier to recognize.' },
    { key: 'highContrast', label: t.highContrast || fallbackText.highContrast, detail: 'Strengthen borders and text contrast.' },
    { key: 'reduceTransparency', label: t.reduceTransparency || fallbackText.reduceTransparency, detail: 'Use more solid panels and reduce layered glass effects.' },
    { key: 'reduceMotion', label: t.reduceMotion || fallbackText.reduceMotion, detail: 'Limit motion-heavy transitions and animated effects.' },
    { key: 'simplifyVisuals', label: t.simplifyVisuals || fallbackText.simplifyVisuals, detail: 'Hide extra decorative details for a calmer page.' },
    { key: 'dimNonEssentialColors', label: t.dimNonEssentialColors || fallbackText.dimNonEssentialColors || 'Dim non-essential colors', detail: 'Tone down accent colors that are not carrying information.' },
    { key: 'darkMode', label: t.darkMode || fallbackText.darkMode || 'Dark mode', detail: 'Use a softer dark palette for longer sessions.' },
    { key: 'hideStickers', label: 'Hide character stickers' },
  ];

  const readingOptions = accessibilityOptions.filter(o => ['largeText', 'largeControls', 'readableSpacing', 'underlineLinks'].includes(o.key));
  const clarityOptions = accessibilityOptions.filter(o => ['highContrast', 'reduceTransparency', 'darkMode'].includes(o.key));
  const visualsOptions = accessibilityOptions.filter(o => ['reduceMotion', 'simplifyVisuals', 'dimNonEssentialColors'].includes(o.key));

  const getSettingIcon = (key) => {
    const iconMap = {
      largeText: Type,
      largeControls: Maximize2,
      readableSpacing: AlignJustify,
      underlineLinks: Link,
      highContrast: Contrast,
      reduceTransparency: Layers,
      darkMode: Moon,
      reduceMotion: CircleOff,
      simplifyVisuals: WandSparkles,
      dimNonEssentialColors: Palette,
    };
    const Icon = iconMap[key] || Settings;
    return <Icon size={16} strokeWidth={2.5} />;
  };

  const getColorBlindPreview = (key) => {
    const swatchesByMode = {
      none: ['#ef4444', '#22c55e', '#3b82f6', '#eab308'],
      protanopia: ['#8f8f3a', '#b6a840', '#4f72c3', '#d7c956'],
      deuteranopia: ['#b09a3d', '#d6c64f', '#6174bd', '#e2d768'],
      tritanopia: ['#e24a4a', '#2aa6a6', '#43b8b8', '#d18a20'],
      'black-white': ['#111827', '#6b7280', '#cbd5e1', '#f8fafc'],
    };
    const swatches = swatchesByMode[key] || swatchesByMode.none;

    return (
      <div style={{ display: 'flex', gap: '3px' }}>
        {swatches.map((color, idx) => (
          <div
            key={idx}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: color,
              border: key === 'black-white' && idx === 3 ? '1px solid #94a3b8' : 'none',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <PageLayout isMobile={isMobile} style={{ fontFamily: 'var(--font-paper)' }}>

      <PaperPageHeader
        isMobile={isMobile}
        center={
          outerSwitcher ?? (
            <PaperHeadingBadge
              isMobile={isMobile}
              icon={Settings}
              title="Settings"
              palette={{
                borderColor: '#818cf8',
                bottomColor: '#4338ca',
                shadow: '0 8px 18px rgba(129, 140, 248, 0.12)',
              }}
              titleColor="#818cf8"
              iconColor="#818cf8"
            />
          )
        }
        marginBottomMobile="0"
        marginBottomDesktop="0"
        paddingMobile="0 10px"
        paddingDesktop="0"
      />

      <div
        className="sketchbook-border"
        style={{
          background: 'var(--surface-card)',
          border: '3px solid #f97316',
          borderBottom: '8px solid #c2410c',
          padding: '20px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.06)',
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto 28px',
          boxSizing: 'border-box',
        }}
      >
        <div style={PANEL_TITLE_STYLE}>
          <div className="panel-icon-box no-override" style={getPanelIconBoxStyle('#fed7aa', '#f97316', '#fff7ed', '#c2410c')}>
            <Clock3 size={18} strokeWidth={2.4} />
          </div>
          <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>Usage summary</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
          {[
            { label: 'Time on site', value: formatDuration(usageStats.totalTimeMs), icon: Clock3, color: '#c2410c' },
            { label: 'Times accessed', value: usageStats.visits || 0, icon: MousePointerClick, color: '#2563eb' },
            { label: 'Page switches', value: usageStats.pageSwitches || 0, icon: Route, color: '#0f766e' },
            { label: 'Most visited page', value: favoritePageName, icon: Trophy, color: '#7e22ce' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="sketchbook-border"
              style={{
                background: 'var(--surface-panel)',
                border: '2.5px solid var(--surface-border)',
                borderBottom: '5px solid var(--surface-border-strong)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: stat.color, fontFamily: 'var(--font-paper)', fontSize: '0.8rem' }}>
                <stat.icon size={15} strokeWidth={2.5} />
                <span>{stat.label}</span>
              </div>
              <div style={{
                fontFamily: 'var(--font-paper)',
                fontSize: stat.label === 'Most visited page' ? '1.05rem' : '1.25rem',
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                overflowWrap: 'anywhere',
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div
          className="sketchbook-border"
          style={{
            background: '#fff7ed',
            border: '2.5px dashed #fdba74',
            color: '#9a3412',
            padding: '10px 12px',
            fontFamily: 'var(--font-paper)',
            fontSize: '0.82rem',
            lineHeight: 1.45,
          }}
        >
          {usageRoast} Synced with your sync key across devices.
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: isMobile ? '22px' : '20px',
        alignItems: 'start',
        width: '100%',
        maxWidth: '1240px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '22px' : '20px' }}>
          {/* A1. Text & Reading Preferences Card */}
          <div
            className="sketchbook-border"
            style={{
              background: 'var(--surface-card)',
              border: '3px solid #f472b6',
              borderBottom: '8px solid #db2777',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
            }}
          >
            <div
              className="washi-tape washi-tape--pink"
              style={{
                top: '-14px',
                left: '24px',
                transform: 'rotate(-1.5deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
            <div style={PANEL_TITLE_STYLE}>
              <div className="panel-icon-box pink-box no-override" style={getPanelIconBoxStyle('#fbcfe8', '#ec4899', '#fdf2f8', '#db2777')}>
                <FileTextIcon size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>Accessibility & display</span>
            </div>

            <SettingsDropdown
              title={t.textAndReading || 'Text & Reading'}
              value={`${readingOptions.filter((option) => accessibilityPrefs[option.key]).length}/${readingOptions.length}`}
              defaultOpen={!isMobile}
            >
              {readingOptions.map(option => {
                const val = !!accessibilityPrefs[option.key];
                return (
                  <SettingsToggleRow
                    key={option.key}
                    icon={getSettingIcon(option.key)}
                    iconBackground="#fce7f3"
                    iconColor="#db2777"
                    title={option.label}
                    detail={option.detail}
                    checked={val}
                    onClick={() => toggleAccessibilityPref(option.key)}
                    last={option.key === readingOptions[readingOptions.length - 1]?.key}
                  />
                );
              })}
            </SettingsDropdown>

            <SettingsDropdown
              title={t.displayAndContrast || 'Display & Contrast'}
              value={`${clarityOptions.filter((option) => accessibilityPrefs[option.key]).length}/${clarityOptions.length}`}
            >
              {clarityOptions.map(option => {
                const val = !!accessibilityPrefs[option.key];
                return (
                  <SettingsToggleRow
                    key={option.key}
                    icon={getSettingIcon(option.key)}
                    iconBackground="#dbeafe"
                    iconColor="#1d4ed8"
                    title={option.label}
                    detail={option.detail}
                    checked={val}
                    onClick={() => toggleAccessibilityPref(option.key)}
                    last={option.key === clarityOptions[clarityOptions.length - 1]?.key}
                  />
                );
              })}
            </SettingsDropdown>

            <SettingsDropdown
              title={t.motionAndVisuals || 'Motion & Visuals'}
              value={`${visualsOptions.filter((option) => accessibilityPrefs[option.key]).length}/${visualsOptions.length}`}
            >
              {visualsOptions.map(option => {
                const val = !!accessibilityPrefs[option.key];
                return (
                  <SettingsToggleRow
                    key={option.key}
                    icon={getSettingIcon(option.key)}
                    iconBackground="#fef3c7"
                    iconColor="#b45309"
                    title={option.label}
                    detail={option.detail}
                    checked={val}
                    onClick={() => toggleAccessibilityPref(option.key)}
                    last={option.key === visualsOptions[visualsOptions.length - 1]?.key}
                  />
                );
              })}
            </SettingsDropdown>

            <SettingsDropdown
              title={colorBlindLabel}
              value={colorBlindOptions.find((option) => option.key === (accessibilityPrefs.colorBlindMode || 'none'))?.label || 'Off'}
            >
            <div role="radiogroup" aria-label={colorBlindLabel}>
              {colorBlindOptions.map((option) => {
                const selected = (accessibilityPrefs.colorBlindMode || 'none') === option.key;
                return (
                  <SettingsChoiceRow
                    key={option.key}
                    icon={getColorBlindPreview(option.key)}
                    iconBackground="#f3e8ff"
                    iconColor="#7e22ce"
                    title={option.label}
                    detail={option.detail}
                    selected={selected}
                    onClick={() => setAccessibilityColorBlindMode(option.key)}
                    last={option.key === colorBlindOptions[colorBlindOptions.length - 1]?.key}
                  />
                );
              })}
            </div>
            </SettingsDropdown>
          </div>

          {/* B. Blog Reader Options Card */}
          {readerPrefs && setReaderPrefs && (
            <div
              className="sketchbook-border"
              style={{
                background: 'var(--surface-card)',
                border: '3px solid #f97316',
                borderBottom: '8px solid #ea580c',
                padding: '20px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
              }}
            >
              <div
                className="washi-tape washi-tape--yellow"
                style={{
                  top: '-14px',
                  left: '24px',
                  transform: 'rotate(-1.8deg)',
                  width: '74px',
                  height: '22px',
                  zIndex: 5,
                }}
              />
               <div style={PANEL_TITLE_STYLE}>
                <div className="panel-icon-box orange-box no-override" style={getPanelIconBoxStyle('#f59e0b', '#d97706', '#fef3c7', '#d97706')}>
                  <Sparkle size={18} strokeWidth={2.4} style={{ color: '#d97706' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{t.readerControls || 'Blog reader options'}</span>
              </div>

              <SettingsDropdown
                title="Reader layout"
                value={`${[
                  readerPrefs.largeText,
                  readerPrefs.wideSpacing,
                  readerPrefs.focusWidth,
                ].filter(Boolean).length}/3`}
              >
                {[
                  { key: 'largeText', label: t.largeTextMode || 'Larger text', Icon: ALargeSmall, detail: 'Increase article text inside the blog reader.' },
                  { key: 'wideSpacing', label: t.widerSpacingMode || 'Wider spacing', Icon: Space, detail: 'Loosen paragraph spacing for slower reading.' },
                  { key: 'focusWidth', label: t.focusWidthMode || 'Narrow column', Icon: Focus, detail: 'Keep articles in a narrower, easier scanning column.' },
                ].map((pref, index, prefs) => {
                  const isActive = !!readerPrefs[pref.key];
                  return (
                    <SettingsToggleRow
                      key={pref.key}
                      icon={<pref.Icon size={16} strokeWidth={2.4} />}
                      iconBackground="#ffedd5"
                      iconColor="#c2410c"
                      title={pref.label}
                      detail={pref.detail}
                      checked={isActive}
                      onClick={() => setReaderPrefs(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                      last={index === prefs.length - 1}
                    />
                  );
                })}
              </SettingsDropdown>

              <SettingsDropdown
                title="Reader color theme"
                value={[
                  { key: 'paper', label: t.themePaper || 'Paper' },
                  { key: 'sepia', label: t.themeSepia || 'Sepia' },
                  { key: 'night', label: t.themeNight || 'Night' },
                ].find((option) => option.key === readerPrefs.theme)?.label || 'Paper'}
              >
                <div role="radiogroup" aria-label="Reader color theme">
                  {[
                    { key: 'paper', label: t.themePaper || 'Paper', bg: '#fff7ed', border: '#fdba74', text: '#7c2d12', Icon: FileTextIcon, detail: 'Warm paper background for daytime reading.' },
                    { key: 'sepia', label: t.themeSepia || 'Sepia', bg: '#fef3c7', border: '#f59e0b', text: '#78350f', Icon: Sun, detail: 'Amber tint for softer contrast.' },
                    { key: 'night', label: t.themeNight || 'Night', bg: '#0f172a', border: '#334155', text: '#f8fafc', Icon: Moon, detail: 'Dark reader surface for low light.' },
                  ].map((themeOpt, index, themes) => {
                    const isThemeActive = readerPrefs.theme === themeOpt.key;
                    return (
                      <SettingsChoiceRow
                        key={themeOpt.key}
                        icon={<themeOpt.Icon size={16} strokeWidth={2.4} />}
                        iconBackground={themeOpt.bg}
                        iconColor={themeOpt.text}
                        title={themeOpt.label}
                        detail={themeOpt.detail}
                        selected={isThemeActive}
                        onClick={() => setReaderPrefs(prev => ({ ...prev, theme: themeOpt.key }))}
                        last={index === themes.length - 1}
                      />
                    );
                  })}
                </div>
              </SettingsDropdown>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Language, shortcuts, and supporting controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Language and shortcuts */}
          <div
            className="sketchbook-border"
            style={{
              background: 'var(--surface-card)',
              border: '3px solid #10b981',
              borderBottom: '8px solid #047857',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
            }}
          >
            <div
              className="washi-tape washi-tape--blue"
              style={{
                top: '-14px',
                left: '24px',
                transform: 'rotate(-2deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
             <div style={PANEL_TITLE_STYLE}>
              <div className="panel-icon-box green-box no-override" style={getPanelIconBoxStyle('#a7f3d0', '#10b981', '#ecfdf5', '#047857')}>
                <Languages size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>Language & controls</span>
            </div>

            <SettingsDropdown
              title={t.language || 'Language'}
              value={appLanguageOptions.find((option) => option.code === uiLanguage)?.name || uiLanguage}
              defaultOpen={!isMobile}
            >
            <div role="radiogroup" aria-label={t.language || 'Language'}>
              {appLanguageOptions.map(({ code, name }, index) => {
                const isActive = code === uiLanguage;
                return (
                  <SettingsChoiceRow
                    key={code}
                    icon={<Globe2 size={16} strokeWidth={2.5} />}
                    iconBackground="#ecfdf5"
                    iconColor="#047857"
                    title={name}
                    detail={languageDetails[code] || 'Switch menus and labels to this language.'}
                    selected={isActive}
                    onClick={() => setUiLanguage(code)}
                    last={index === appLanguageOptions.length - 1}
                  />
                );
              })}
            </div>
            </SettingsDropdown>

            {!isMobile && (
              <SettingsDropdown title={t.shortcuts || 'Keyboard shortcuts'} value={`${shortcutRows.length}`}>
                <p style={{
                  fontFamily: 'var(--font-paper)',
                  fontSize: '0.84rem',
                  color: '#4b5563',
                  fontWeight: '400',
                  margin: '0',
                  padding: '12px 14px',
                  lineHeight: 1.4,
                  borderBottom: '1.5px solid rgba(148, 163, 184, 0.32)',
                }}>
                  {t.shortcutsIntro || 'Use keyboard shortcuts to quickly navigate the notebook.'}
                </p>
                {shortcutRows.map((row) => (
                  <SettingsRow
                    key={row.keyLabel}
                    icon={<row.icon size={15} strokeWidth={2.5} />}
                    iconBackground="#eef2ff"
                    iconColor="#4f46e5"
                    title={row.description}
                    detail={row.detail}
                    value={row.keyLabel}
                    last={row.keyLabel === shortcutRows[shortcutRows.length - 1]?.keyLabel}
                  />
                ))}
              </SettingsDropdown>
            )}
          </div>

        </div>

        {/* App install and offline library */}
        <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
          <div
            className="sketchbook-border"
            style={{
              background: 'var(--surface-card)',
              border: '3px solid #7c3aed',
              borderBottom: '8px solid #6d28d9',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.06)',
            }}
          >
            <div style={PANEL_TITLE_STYLE}>
              <div className="panel-icon-box no-override" style={getPanelIconBoxStyle('#ddd6fe', '#7c3aed', '#f5f3ff', '#6d28d9')}>
                {isInstalled ? <CheckCircle size={18} strokeWidth={2.4} /> : <Smartphone size={18} strokeWidth={2.4} />}
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>
                App installation & offline
              </span>
            </div>

            <SettingsDropdown
              title="Installation"
              value={isInstalled ? 'Installed' : canInstall ? 'Available' : 'Browser'}
              defaultOpen={!isMobile}
            >
              <SettingsRow
                icon={isInstalled ? <CheckCircle size={17} strokeWidth={2.5} /> : <Download size={17} strokeWidth={2.5} />}
                iconBackground="#ede9fe"
                iconColor="#6d28d9"
                title="Install"
                detail={isInstalled ? 'Opens from your launcher or home screen.' : canInstall ? 'Add a focused app window for this device.' : 'Use the browser install menu on this device.'}
                value={isInstalled ? 'Installed' : canInstall ? 'Available' : 'Browser'}
                onClick={canInstall && !isInstalled ? handleInstall : undefined}
                disabled={!canInstall || isInstalled}
                last={!updateReady}
              />
              {updateReady && (
                <SettingsRow
                  icon={<RefreshCw size={16} strokeWidth={2.5} />}
                  iconBackground="#dbeafe"
                  iconColor="#1d4ed8"
                  title="Update app"
                  detail="A fresh app shell is ready."
                  value="Ready"
                  onClick={handleApplyUpdate}
                  last
                />
              )}
            </SettingsDropdown>

            <SettingsDropdown
              title="Device features"
              value={performancePreference === 'auto' ? `Auto: ${resolvedPerformanceMode === 'efficient' ? 'Efficiency' : 'Full'}` : (resolvedPerformanceMode === 'efficient' ? 'Efficiency' : 'Full')}
            >
              <SettingsRow
                icon={<Zap size={17} strokeWidth={2.5} />}
                iconBackground="#dbeafe"
                iconColor="#1d4ed8"
                title="Performance"
                detail={performancePreference === 'auto'
                  ? performanceModeOptions[0].detail
                  : performanceModeOptions.find((option) => option.key === performancePreference)?.detail}
                value={performancePreference === 'auto' ? `Auto: ${resolvedPerformanceMode === 'efficient' ? 'Efficiency' : 'Full'}` : (resolvedPerformanceMode === 'efficient' ? 'Efficiency' : 'Full')}
                onClick={() => {
                  const currentIndex = performanceModeOptions.findIndex((option) => option.key === performancePreference);
                  const nextOption = performanceModeOptions[(currentIndex + 1) % performanceModeOptions.length] || performanceModeOptions[0];
                  handlePerformancePreferenceChange(nextOption.key);
                }}
              />
              <SettingsRow
                icon={<HardDriveDownload size={17} strokeWidth={2.5} />}
                iconBackground="#dcfce7"
                iconColor="#166534"
                title="Storage protection"
                detail={persistentStorage.supported ? 'Ask the browser to keep offline files longer.' : 'This browser does not expose durable storage.'}
                value={persistentStorage.persisted ? 'On' : persistentStorage.requesting ? 'Asking' : persistentStorage.supported ? 'Off' : 'Unavailable'}
                onClick={persistentStorage.supported && !persistentStorage.persisted && !persistentStorage.requesting ? handleRequestPersistentStorage : undefined}
                disabled={!persistentStorage.supported || persistentStorage.persisted || persistentStorage.requesting}
              />
              <SettingsRow
                icon={<Bell size={16} strokeWidth={2.5} />}
                iconBackground="#fce7f3"
                iconColor="#be185d"
                title="Notifications"
                detail={notificationPermission === 'denied' ? 'Blocked in browser settings.' : 'Enable chapter release alerts where the browser supports them.'}
                value={notificationPermission === 'granted' ? 'On' : notificationPermission === 'denied' ? 'Blocked' : notificationPermission === 'unsupported' ? 'Unavailable' : 'Off'}
                onClick={notificationPermission !== 'unsupported' && notificationPermission !== 'granted' ? handleRequestNotifications : undefined}
                disabled={notificationPermission === 'unsupported' || notificationPermission === 'granted'}
              />
              {notificationPermission === 'granted' && (
                <SettingsRow
                  icon={<Bell size={16} strokeWidth={2.5} />}
                  iconBackground="#fdf2f8"
                  iconColor="#be185d"
                  title="Test chapter alert"
                  detail="Send the current chapter release notification."
                  value={notificationTestStatus || 'Send'}
                  onClick={handleTestChapterNotification}
                  disabled={notificationTestStatus === 'Sending'}
                />
              )}
              <SettingsRow
                icon={<Share2 size={16} strokeWidth={2.5} />}
                iconBackground="#cffafe"
                iconColor="#0e7490"
                title="Share app"
                detail="Open the device share sheet."
                value={canShareApp ? '' : 'Unavailable'}
                onClick={canShareApp ? handleShareApp : undefined}
                disabled={!canShareApp}
              />
              <SettingsToggleRow
                icon={<Camera size={17} strokeWidth={2.5} />}
                iconBackground="#cffafe"
                iconColor="#0e7490"
                title="Sticker Camera theme"
                detail="Use the colorful sketchbook UI in Sticker Camera."
                checked={themedCamera}
                onClick={() => {
                  const next = !themedCamera;
                  setThemedCamera(next);
                  setThemedCameraEnabled(next);
                }}
                last
              />
            </SettingsDropdown>

            <SettingsDropdown
              title="Offline library"
              value={`${offlineProgress}%`}
            >
              <SettingsRow
                icon={<WifiOff size={17} strokeWidth={2.5} />}
                iconBackground="#fef3c7"
                iconColor="#b45309"
                title={selectedOfflineGroup.label}
                detail={offlineStatus.preparing
                  ? `Cached ${displayedOfflineCached} of ${offlineStatus.total} files.`
                  : offlineProgress >= 100
                    ? 'Prepared for offline use.'
                    : selectedOfflineGroup.detail}
                value={`${offlineProgress}%`}
                onClick={isOnline && !offlineStatus.preparing ? () => handlePrepareOffline({ groupKey: offlineGroupKey }) : undefined}
                disabled={!isOnline || offlineStatus.preparing}
              />
              {OFFLINE_ASSET_GROUPS.map((group, index) => {
                const selected = group.key === offlineGroupKey;
                const assetCount = group.getAssets().length;
                const stats = cacheGroupStats[group.key] || { count: 0, bytes: 0 };
                return (
                  <SettingsRow
                    key={group.key}
                    icon={<Download size={16} strokeWidth={2.5} />}
                    iconBackground={selected ? '#fef3c7' : '#e2e8f0'}
                    iconColor={selected ? '#b45309' : '#64748b'}
                    title={group.label}
                    detail={stats.count > 0 ? `${group.detail} · ${stats.count}/${assetCount} cached` : group.detail}
                    value={stats.bytes > 0 ? formatBytes(stats.bytes) : `${assetCount}`}
                    onClick={isOnline && !offlineStatus.preparing ? () => handlePrepareOffline({ groupKey: group.key, persist: group.key === 'all' }) : undefined}
                    disabled={!isOnline || offlineStatus.preparing || assetCount === 0}
                    last={index === OFFLINE_ASSET_GROUPS.length - 1}
                  />
                );
              })}
              <div style={{ padding: '0 14px 12px 58px', borderBottom: '1.5px solid rgba(148, 163, 184, 0.32)' }}>
                <div
                  aria-label={`Offline cache progress ${offlineProgress}%`}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={offlineProgress}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '999px',
                    background: '#fffbeb',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ width: `${offlineProgress}%`, height: '100%', background: '#f59e0b', transition: 'width 0.2s ease' }} />
                </div>
                <div style={{ marginTop: '6px', fontFamily: 'var(--font-paper)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {displayedOfflineCached} / {offlineStatus.total} files{storageEstimate ? ` · ${formatBytes(storageEstimate.usage)} used` : ''}
                </div>
              </div>
              <SettingsRow
                icon={<RefreshCw size={16} strokeWidth={2.5} />}
                iconBackground={keepPreparingOffline ? '#dbeafe' : '#e2e8f0'}
                iconColor={keepPreparingOffline ? '#1d4ed8' : '#64748b'}
                title="Prepare while open"
                detail="Continue offline prep when the app is open."
                value={keepPreparingOffline ? 'On' : 'Off'}
                onClick={() => handleKeepPreparingChange(!keepPreparingOffline)}
              />
              <SettingsRow
                icon={<UploadCloud size={16} strokeWidth={2.5} />}
                iconBackground="#d1fae5"
                iconColor="#047857"
                title="Pending sync"
                detail={pendingOfflineActions > 0 ? `${pendingOfflineActions} saved action${pendingOfflineActions === 1 ? '' : 's'} waiting.` : 'Offline actions are synced.'}
                value={pendingOfflineActions > 0 ? `${pendingOfflineActions}` : 'Clear'}
                onClick={isOnline && pendingOfflineActions > 0 ? handleFlushPendingActions : undefined}
                disabled={!isOnline || pendingOfflineActions === 0}
              />
              {OFFLINE_ASSET_GROUPS
                .filter((group) => group.key !== 'all' && (cacheGroupStats[group.key]?.count || 0) > 0)
                .map((group) => {
                  const stats = cacheGroupStats[group.key] || { count: 0, bytes: 0 };
                  const deleting = deletingGroupKey === group.key;
                  return (
                    <SettingsRow
                      key={`delete-${group.key}`}
                      icon={<Trash2 size={16} strokeWidth={2.5} />}
                      iconBackground="#fee2e2"
                      iconColor="#b91c1c"
                      title={deleting ? `Deleting ${group.label}` : `Delete ${group.label}`}
                      detail={`Free ${stats.count} file${stats.count === 1 ? '' : 's'} · ${formatBytes(stats.bytes)}`}
                      value=""
                      onClick={!deleting ? () => handleDeleteGroup(group.key) : undefined}
                      disabled={deleting}
                      destructive
                    />
                  );
                })}
              <SettingsRow
                icon={<Trash2 size={16} strokeWidth={2.5} />}
                iconBackground="#fee2e2"
                iconColor="#b91c1c"
                title={isClearingOfflineCache ? 'Deleting offline cache' : 'Delete all offline files'}
                detail="Remove every prepared file and stop automatic offline prep."
                value=""
                onClick={handleClearOfflineCache}
                disabled={isClearingOfflineCache}
                destructive
                last
              />
            </SettingsDropdown>
          </div>
        </div>

      </div>

    </PageLayout>
  );
};

export default SettingsPage;
