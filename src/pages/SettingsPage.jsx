import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/shared/paper/PageLayout';
import { Accessibility, Keyboard, Languages, Settings, Check, Sparkle, Sun, Moon, FileText as FileTextIcon, ALargeSmall, Space, Focus, Eye, Zap, Download, CheckCircle, Smartphone, WifiOff, RefreshCw } from 'lucide-react';
import { getLanguageOptions, UI } from '../i18n/ui';
import { OFFLINE_PUBLIC_ASSETS } from '../data/offlineAssets.js';
import {
  createPaperChipStyle,
  createPaperPanelStyle,
  PAPER_FONT_FAMILY,
} from '../components/shared/paper/paperTheme';
import PaperPageHeader from '../components/shared/paper/PaperPageHeader';
import PaperHeadingBadge from '../components/shared/paper/PaperHeadingBadge';

const PANEL_TITLE_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: 'var(--font-paper)',
  fontWeight: '400',
  color: 'var(--text-primary)',
  fontSize: '1.2rem',
  letterSpacing: '0.2px',
  borderBottom: '2.5px dashed var(--surface-border)',
  paddingBottom: '10px',
  marginBottom: '16px',
};

const getPanelIconBoxStyle = (border, bottom, background, color) => ({
  ...createPaperChipStyle({
    borderColor: border,
    bottomColor: bottom,
    background,
    color,
    radius: '12px',
    padding: '0',
    minHeight: '34px',
    gap: '0',
  }),
  width: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const getOptionCardStyle = (active = false) => ({
  ...createPaperPanelStyle({
    background: active ? 'var(--surface-card-active)' : 'var(--surface-card)',
    borderColor: active ? '#3b82f6' : 'var(--surface-border)',
    bottomColor: active ? '#2563eb' : 'var(--surface-border-strong)',
    radius: '16px',
    shadow: active ? '0 6px 14px rgba(59,130,246,0.06)' : '0 4px 8px rgba(0,0,0,0.01)',
  }),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  padding: '12px 16px',
  borderWidth: '2.5px',
  borderBottomWidth: active ? '5px' : '4px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});

const KEYCAP_STYLE = {
  ...createPaperChipStyle({
    borderColor: 'var(--surface-border-strong)',
    bottomColor: 'var(--surface-border-strong)',
    background: 'var(--keycap-bg)',
    color: 'var(--keycap-color)',
    radius: '10px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-paper)',
  }),
  minWidth: '48px',
  textAlign: 'center',
  fontWeight: '400',
  lineHeight: 1.1,
  flexShrink: 0,
};

const BUTTON_RESET_STYLE = {
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  padding: 0,
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  color: 'inherit',
  outline: 'none',
  margin: 0,
};

const PREVIEW_QUOTES = {
  en: { title: "Cherry Blossoms", text: "Mitsumi and Sousuke walked to school under the blooming cherry blossoms. It was a beautiful spring morning.", button: "Read Article" },
  es: { title: "Flores de Cerezo", text: "Mitsumi y Sousuke caminaron a la escuela bajo las flores de cerezo en flor. Era una hermosa mañana de primavera.", button: "Leer Artículo" },
  pt: { title: "Flores de Cerejeira", text: "Mitsumi e Sousuke caminharam para a escola sob as flores de cerejeira em flor. Era uma bela manhã de primavera.", button: "Ler Artigo" },
  fr: { title: "Cerisiers en Fleurs", text: "Mitsumi et Sousuke marchèrent vers l’école sous les cerisiers en fleurs. C'était une magnifique matinée de printemps.", button: "Lire l'Article" },
  de: { title: "Kirschblüten", text: "Mitsumi und Sousuke gingen unter den blühenden Kirschblüten zur Schule. Es war ein wunderschöner Frühlingsmorgen.", button: "Artikel Lesen" },
  it: { title: "Fiori di Ciliegio", text: "Mitsumi e Sousuke camminarono verso la scuola sotto i ciliegi in fiore. Era una splendida mattina di primavera.", button: "Leggi Articolo" },
  ja: { title: "桜の並木道", text: "美津未と聡介は咲き誇る桜の下を歩いて登校した。美しい春の朝だった。", button: "記事を読む" },
};

const INSTALL_PROMPT_READY_EVENT = 'skip_install_prompt_ready';
const OFFLINE_LIBRARY_ENABLED_KEY = 'skip_offline_library_enabled_v1';

const getSavedInstallPrompt = () => window.__skipInstallPromptEvent || null;

const SettingsPage = ({
  isMobile,
  uiLanguage,
  setUiLanguage,
  accessibilityPrefs,
  toggleAccessibilityPref,
  setAccessibilityColorBlindMode,
  shortcutStats,
  readerPrefs,
  setReaderPrefs,
  t,
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
  const [storageEstimate, setStorageEstimate] = useState(null);
  const [keepPreparingOffline, setKeepPreparingOffline] = useState(() => {
    try {
      return localStorage.getItem(OFFLINE_LIBRARY_ENABLED_KEY) === '1';
    } catch {
      return false;
    }
  });

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
    const refreshStorageStatus = async () => {
      try {
        if ('storage' in navigator && typeof navigator.storage.estimate === 'function') {
          setStorageEstimate(await navigator.storage.estimate());
        }

        if ('caches' in window) {
          const cacheNames = await caches.keys();
          const offlineCacheNames = cacheNames.filter((name) => name.startsWith('skip-offline-'));
          const cacheCounts = await Promise.all(
            offlineCacheNames.map(async (cacheName) => {
              const cache = await caches.open(cacheName);
              return (await cache.keys()).length;
            }),
          );
          const cached = cacheCounts.reduce((sum, count) => sum + count, 0);
          setOfflineStatus((previous) => ({ ...previous, cached }));
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
          cached: Number(event.data.cached || previous.cached || 0),
          processed: Number(event.data.processed || previous.processed || 0),
          total: Number(event.data.total || previous.total || OFFLINE_PUBLIC_ASSETS.length),
          preparing: true,
        }));
        return;
      }

      if (event.data?.type !== 'SKIP_OFFLINE_CACHE_COMPLETE') return;
      setOfflineStatus({
        cached: Number(event.data.cached || 0),
        processed: Number(event.data.total || OFFLINE_PUBLIC_ASSETS.length),
        total: Number(event.data.total || OFFLINE_PUBLIC_ASSETS.length),
        preparing: false,
      });
      refreshStorageStatus();
    };

    refreshStorageStatus();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

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

  const handlePrepareOffline = async ({ persist = true } = {}) => {
    if (!navigator.serviceWorker?.controller && !navigator.serviceWorker?.ready) return;
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
      total: OFFLINE_PUBLIC_ASSETS.length,
    }));

    const registration = await navigator.serviceWorker.ready.catch(() => null);
    const worker = registration?.active || navigator.serviceWorker.controller;
    if (!worker) {
      setOfflineStatus((previous) => ({ ...previous, preparing: false }));
      return;
    }

    worker.postMessage({
      type: 'SKIP_CACHE_OFFLINE_ASSETS',
      assets: OFFLINE_PUBLIC_ASSETS,
    });
  };

  const handleKeepPreparingChange = (enabled) => {
    setKeepPreparingOffline(enabled);
    try {
      if (enabled) {
        localStorage.setItem(OFFLINE_LIBRARY_ENABLED_KEY, '1');
        handlePrepareOffline({ persist: false });
      } else {
        localStorage.removeItem(OFFLINE_LIBRARY_ENABLED_KEY);
      }
    } catch {
      // Ignore storage failures.
    }
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

  const offlineProgress = Math.max(
    0,
    Math.min(100, Math.round(((offlineStatus.processed || offlineStatus.cached || 0) / Math.max(1, offlineStatus.total)) * 100)),
  );

  const appLanguageOptions = getLanguageOptions();
  const colorBlindLabel = t.colorVisionMode || fallbackText.colorVisionMode || 'Color vision mode';

  const colorBlindOptions = [
    { key: 'none', label: t.colorVisionOff || fallbackText.colorVisionOff || 'Off' },
    { key: 'protanopia', label: t.colorVisionProtanopia || fallbackText.colorVisionProtanopia || 'Protanopia' },
    { key: 'deuteranopia', label: t.colorVisionDeuteranopia || fallbackText.colorVisionDeuteranopia || 'Deuteranopia' },
    { key: 'tritanopia', label: t.colorVisionTritanopia || fallbackText.colorVisionTritanopia || 'Tritanopia' },
    { key: 'black-white', label: t.colorVisionBlackWhite || fallbackText.colorVisionBlackWhite || 'Black & White' },
  ];

  const shortcutRows = [
    { keyLabel: '1..8', description: t.mainTabShortcut || fallbackText.mainTabShortcut || 'Jump to a main tab', icon: '🏠' },
    { keyLabel: 'Q / E', description: t.prevNextSubtab || fallbackText.prevNextSubtab || 'Previous / next subtab', icon: '↔️' },
    { keyLabel: 'Alt+A', description: t.accessibility || 'Accessibility', icon: '♿' },
    { keyLabel: 'Alt+K', description: t.shortcuts || 'Keyboard Help', icon: '⌨️' },
    { keyLabel: 'Esc', description: t.close || 'Close overlay', icon: '✖️' },
  ];

  const accessibilityOptions = [
    { key: 'largeText', label: t.largeText || fallbackText.largeText },
    { key: 'largeControls', label: t.largeControls || fallbackText.largeControls },
    { key: 'readableSpacing', label: t.readableSpacing || fallbackText.readableSpacing },
    { key: 'underlineLinks', label: t.underlineLinks || fallbackText.underlineLinks },
    { key: 'highContrast', label: t.highContrast || fallbackText.highContrast },
    { key: 'reduceTransparency', label: t.reduceTransparency || fallbackText.reduceTransparency },
    { key: 'reduceMotion', label: t.reduceMotion || fallbackText.reduceMotion },
    { key: 'simplifyVisuals', label: t.simplifyVisuals || fallbackText.simplifyVisuals },
    { key: 'dimNonEssentialColors', label: t.dimNonEssentialColors || fallbackText.dimNonEssentialColors || 'Dim non-essential colors' },
    { key: 'darkMode', label: t.darkMode || fallbackText.darkMode || 'Comfortable dark mode' },
    { key: 'hideStickers', label: 'Hide character stickers' },
  ];

  const readingOptions = accessibilityOptions.filter(o => ['largeText', 'largeControls', 'readableSpacing', 'underlineLinks'].includes(o.key));
  const clarityOptions = accessibilityOptions.filter(o => ['highContrast', 'reduceTransparency', 'darkMode'].includes(o.key));
  const visualsOptions = accessibilityOptions.filter(o => ['reduceMotion', 'simplifyVisuals', 'dimNonEssentialColors'].includes(o.key));

  const getLanguageVisual = (code) => {
    const flags = {
      en: '🇺🇸',
      es: '🇪🇸',
      pt: '🇧🇷',
      fr: '🇫🇷',
      de: '🇩🇪',
      it: '🇮🇹',
      ja: '🇯🇵',
    };
    return (
      <span style={{ fontSize: '1.35rem', marginRight: '8px', display: 'inline-flex', alignItems: 'center' }}>
        {flags[code] || '🌐'}
      </span>
    );
  };

  const getVisualPreview = (key, val) => {
    switch (key) {
      case 'largeText':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginRight: '6px', minWidth: '40px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Aa</span>
            <span style={{ fontSize: '1.05rem', color: '#1e293b' }}>Aa</span>
          </div>
        );
      case 'largeControls':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '6px', minWidth: '40px' }}>
            <span style={{ padding: '2.5px 5px', background: '#cbd5e1', borderRadius: '3px', fontSize: '0.62rem' }}>A</span>
            <span style={{ padding: '3.5px 7px', background: '#3b82f6', color: '#fff', borderRadius: '5px', fontSize: '0.75rem' }}>A</span>
          </div>
        );
      case 'readableSpacing':
        return (
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: val ? '4px' : '2px', marginRight: '6px', width: '22px' }}>
            <div style={{ height: '2px', background: '#64748b', width: '100%' }} />
            <div style={{ height: '2px', background: '#64748b', width: '100%' }} />
            <div style={{ height: '2px', background: '#64748b', width: '100%' }} />
          </div>
        );
      case 'underlineLinks':
        return (
          <span style={{ textDecoration: 'underline', color: '#3b82f6', fontSize: '0.8rem', marginRight: '6px', minWidth: '40px' }}>
            abc
          </span>
        );
      case 'highContrast':
        return (
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'conic-gradient(#000 180deg, #fff 180deg)',
            border: '2px solid #000',
            marginRight: '6px'
          }} />
        );
      case 'darkMode':
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '6px',
            width: '18px',
          }}>
            <span style={{ fontSize: '0.85rem' }}>🌙</span>
          </div>
        );
      case 'reduceTransparency':
        return (
          <div style={{ display: 'inline-flex', gap: '3px', marginRight: '6px' }}>
            <div style={{ width: '11px', height: '11px', background: 'rgba(59,130,246,0.3)', borderRadius: '2.5px' }} />
            <div style={{ width: '11px', height: '11px', background: '#3b82f6', borderRadius: '2.5px' }} />
          </div>
        );
      case 'reduceMotion':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginRight: '6px', width: '18px' }}>
            <span style={{ fontSize: '0.85rem', display: 'inline-block' }}>🌀</span>
            {val && <span style={{ position: 'absolute', color: '#ef4444', fontSize: '1rem' }}>/</span>}
          </div>
        );
      case 'simplifyVisuals':
        return (
          <div style={{ display: 'inline-flex', gap: '3px', marginRight: '6px', fontSize: '0.8rem', width: '18px' }}>
            <span>{val ? '•' : '✨'}</span>
          </div>
        );
      case 'dimNonEssentialColors':
        return (
          <div style={{ display: 'inline-flex', gap: '2px', marginRight: '6px' }}>
            <div style={{ width: '5px', height: '11px', background: val ? '#94a3b8' : '#ef4444', borderRadius: '0.8px' }} />
            <div style={{ width: '5px', height: '11px', background: val ? '#cbd5e1' : '#10b981', borderRadius: '0.8px' }} />
            <div style={{ width: '5px', height: '11px', background: val ? '#e2e8f0' : '#3b82f6', borderRadius: '0.8px' }} />
          </div>
        );
      default:
        return null;
    }
  };

  const getColorBlindPreview = (key) => {
    const swatches = [
      { color: '#ef4444', name: 'Red' },
      { color: '#22c55e', name: 'Green' },
      { color: '#3b82f6', name: 'Blue' },
      { color: '#eab308', name: 'Yellow' }
    ];

    const filterName = key === 'none' ? 'none' : `url(#filter-${key})`;

    return (
      <div style={{ display: 'flex', gap: '4px', marginRight: '8px', filter: filterName }}>
        {swatches.map((s, idx) => (
          <div
            key={idx}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: s.color,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
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

      {/* Beautiful, Balanced Scrapbook Two-Column Grid Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
        gap: '28px',
        alignItems: 'start',
        width: '100%',
        maxWidth: '1240px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        {/* LEFT COLUMN: Accessibility Options & Blog Reader Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{t.textAndReading || 'Text & Reading'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {readingOptions.map(option => {
                const val = !!accessibilityPrefs[option.key];
                return (
                  <motion.button
                    key={option.key}
                    type="button"
                    role="checkbox"
                    aria-checked={val}
                    onClick={() => toggleAccessibilityPref(option.key)}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      ...BUTTON_RESET_STYLE,
                      ...getOptionCardStyle(val),
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getVisualPreview(option.key, val)}
                      <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.88rem', color: 'var(--text-primary, #334155)', fontWeight: '400' }}>
                        {option.label}
                      </span>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: val ? '#3b82f6' : 'var(--surface-card, #fff)',
                      borderColor: val ? '#2563eb' : '#cbd5e1',
                      flexShrink: 0,
                    }}>
                      {val && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* A2. Display & Contrast Card */}
          <div
            className="sketchbook-border"
            style={{
              background: 'var(--surface-card)',
              border: '3px solid #3b82f6',
              borderBottom: '8px solid #2563eb',
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
                right: '24px',
                transform: 'rotate(2deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
            <div style={PANEL_TITLE_STYLE}>
              <div className="panel-icon-box blue-box no-override" style={getPanelIconBoxStyle('#bfdbfe', '#3b82f6', '#eff6ff', '#1d4ed8')}>
                <Eye size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{t.displayAndContrast || 'Display & Contrast'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {clarityOptions.map(option => {
                const val = !!accessibilityPrefs[option.key];
                return (
                  <motion.button
                    key={option.key}
                    type="button"
                    role="checkbox"
                    aria-checked={val}
                    onClick={() => toggleAccessibilityPref(option.key)}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      ...BUTTON_RESET_STYLE,
                      ...getOptionCardStyle(val),
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getVisualPreview(option.key, val)}
                      <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.88rem', color: 'var(--text-primary, #334155)', fontWeight: '400' }}>
                        {option.label}
                      </span>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: val ? '#3b82f6' : 'var(--surface-card, #fff)',
                      borderColor: val ? '#2563eb' : '#cbd5e1',
                      flexShrink: 0,
                    }}>
                      {val && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* A3. Motion & Visuals Card */}
          <div
            className="sketchbook-border"
            style={{
              background: 'var(--surface-card)',
              border: '3px solid #eab308',
              borderBottom: '8px solid #ca8a04',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
            }}
          >
            <div
              className="washi-tape washi-tape--yellow"
              style={{
                top: '-14px',
                left: '32px',
                transform: 'rotate(-2.5deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
            <div style={PANEL_TITLE_STYLE}>
              <div className="panel-icon-box orange-box no-override" style={getPanelIconBoxStyle('#fef08a', '#eab308', '#fef9c3', '#ca8a04')}>
                <Zap size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{t.motionAndVisuals || 'Motion & Visuals'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {visualsOptions.map(option => {
                const val = !!accessibilityPrefs[option.key];
                return (
                  <motion.button
                    key={option.key}
                    type="button"
                    role="checkbox"
                    aria-checked={val}
                    onClick={() => toggleAccessibilityPref(option.key)}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      ...BUTTON_RESET_STYLE,
                      ...getOptionCardStyle(val),
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getVisualPreview(option.key, val)}
                      <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.88rem', color: 'var(--text-primary, #334155)', fontWeight: '400' }}>
                        {option.label}
                      </span>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: val ? '#3b82f6' : 'var(--surface-card, #fff)',
                      borderColor: val ? '#2563eb' : '#cbd5e1',
                      flexShrink: 0,
                    }}>
                      {val && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* A4. Colorblindness Settings Card */}
          <div
            className="sketchbook-border"
            style={{
              background: 'var(--surface-card)',
              border: '3px solid #a855f7',
              borderBottom: '8px solid #7e22ce',
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
                right: '32px',
                transform: 'rotate(1.8deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
            <div style={PANEL_TITLE_STYLE}>
              <div className="panel-icon-box purple-box no-override" style={getPanelIconBoxStyle('#e9d5ff', '#a855f7', '#f3e8ff', '#7e22ce')}>
                <Accessibility size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{colorBlindLabel}</span>
            </div>

            <div role="radiogroup" aria-label={colorBlindLabel} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {colorBlindOptions.map((option) => {
                const selected = (accessibilityPrefs.colorBlindMode || 'none') === option.key;
                return (
                  <motion.button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAccessibilityColorBlindMode(option.key)}
                    whileTap={{ scale: 0.98 }}
                    className="sketchbook-border"
                    style={{
                      ...BUTTON_RESET_STYLE,
                      ...getOptionCardStyle(selected),
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getColorBlindPreview(option.key)}
                      <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.84rem', color: '#334155', fontWeight: '400' }}>
                        {option.label}
                      </span>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--surface-card, #fff)',
                      borderColor: selected ? '#3b82f6' : '#cbd5e1',
                      flexShrink: 0,
                    }}>
                      {selected && (
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                        }} />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { key: 'largeText', label: t.largeTextMode || 'Larger text', Icon: ALargeSmall },
                  { key: 'wideSpacing', label: t.widerSpacingMode || 'Wider spacing', Icon: Space },
                  { key: 'focusWidth', label: t.focusWidthMode || 'Comfort width', Icon: Focus },
                ].map((pref) => {
                  const isActive = !!readerPrefs[pref.key];
                  return (
                    <motion.button
                      key={pref.key}
                      type="button"
                      role="checkbox"
                      aria-checked={isActive}
                      onClick={() => setReaderPrefs(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        ...BUTTON_RESET_STYLE,
                        ...getOptionCardStyle(isActive),
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-paper)',
                        fontSize: '0.88rem',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '400',
                      }}>
                        <pref.Icon size={16} strokeWidth={2.4} style={{ color: isActive ? '#3b82f6' : '#64748b' }} />
                        {pref.label}
                      </span>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: '2px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActive ? '#3b82f6' : 'var(--surface-card, #fff)',
                        borderColor: isActive ? '#2563eb' : '#cbd5e1',
                        flexShrink: 0,
                      }}>
                        {isActive && <Check size={14} color="#fff" strokeWidth={3} />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontFamily: 'var(--font-paper)', color: '#64748b', fontSize: '0.84rem', fontWeight: '400' }}>
                  Reader color theme
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { key: 'paper', label: t.themePaper || 'Paper', bg: '#fff7ed', border: '#fdba74', text: '#7c2d12', Icon: FileTextIcon },
                    { key: 'sepia', label: t.themeSepia || 'Sepia', bg: '#fef3c7', border: '#f59e0b', text: '#78350f', Icon: Sun },
                    { key: 'night', label: t.themeNight || 'Night', bg: '#0f172a', border: '#334155', text: '#f8fafc', Icon: Moon },
                  ].map((themeOpt) => {
                    const isThemeActive = readerPrefs.theme === themeOpt.key;
                    return (
                      <motion.button
                        key={themeOpt.key}
                        type="button"
                        onClick={() => setReaderPrefs(prev => ({ ...prev, theme: themeOpt.key }))}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="sketchbook-border"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 6px',
                          background: themeOpt.bg,
                          color: themeOpt.text,
                          border: isThemeActive ? `3px solid #3b82f6` : `2px solid ${themeOpt.border}`,
                          borderBottom: isThemeActive ? `5px solid #2563eb` : `4px solid ${themeOpt.border}`,
                          cursor: 'pointer',
                          boxShadow: isThemeActive ? '0 4px 8px rgba(59,130,246,0.1)' : 'none',
                          transition: 'all 0.1s ease',
                          fontWeight: '400',
                        }}
                      >
                        <themeOpt.Icon size={16} strokeWidth={isThemeActive ? 3 : 2.2} />
                        <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.8rem', fontWeight: '400' }}>
                          {themeOpt.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Live Visual Preview, Language Selector & Shortcuts Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* A. Live Visual Preview Card */}
          <div
            className="sketchbook-border"
            style={{
              background: 'var(--surface-card)',
              border: '3px solid #14b8a6',
              borderBottom: '8px solid #0f766e',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
            }}
          >
            <div
              className="washi-tape washi-tape--pink"
              style={{
                top: '-14px',
                right: '24px',
                transform: 'rotate(1.5deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
             <div style={PANEL_TITLE_STYLE}>
              <div className="panel-icon-box teal-box no-override" style={getPanelIconBoxStyle('#99f6e4', '#14b8a6', '#f0fdfa', '#0f766e')}>
                <Sparkle size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>Visual preview</span>
            </div>

            <div
              className="sketchbook-border"
              style={{
                border: accessibilityPrefs.highContrast ? (accessibilityPrefs.darkMode ? '3.5px solid #fff' : '3.5px solid #000') : '3px solid #fdba74',
                borderBottom: accessibilityPrefs.highContrast ? (accessibilityPrefs.darkMode ? '7px solid #fff' : '7px solid #000') : '6px solid #f97316',
                background: readerPrefs?.theme === 'night' ? '#0f172a' : (readerPrefs?.theme === 'sepia' ? '#fef3c7' : '#fff7ed'),
                color: readerPrefs?.theme === 'night' ? '#f8fafc' : (readerPrefs?.theme === 'sepia' ? '#451a03' : '#431407'),
                padding: accessibilityPrefs.largeControls ? '16px 18px' : '12px 14px',
                transition: 'all 0.2s ease',
                filter: accessibilityPrefs.colorBlindMode && accessibilityPrefs.colorBlindMode !== 'none' ? `url(#filter-${accessibilityPrefs.colorBlindMode})` : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: accessibilityPrefs.readableSpacing || readerPrefs?.wideSpacing ? '14px' : '8px',
                boxSizing: 'border-box',
              }}
            >
              <h4 style={{
                margin: 0,
                fontFamily: 'var(--font-paper)',
                fontSize: (accessibilityPrefs.largeText || readerPrefs?.largeText) ? '1.3rem' : '1.1rem',
                lineHeight: 1.2,
                textDecoration: accessibilityPrefs.underlineLinks ? 'underline' : 'none',
                fontWeight: '400',
              }}>
                {PREVIEW_QUOTES[uiLanguage]?.title || PREVIEW_QUOTES.en.title}
              </h4>
              
              <p style={{
                margin: 0,
                fontFamily: 'var(--font-paper)',
                fontSize: (accessibilityPrefs.largeText || readerPrefs?.largeText) ? '0.92rem' : '0.8rem',
                lineHeight: accessibilityPrefs.readableSpacing || readerPrefs?.wideSpacing ? 1.75 : 1.45,
                letterSpacing: accessibilityPrefs.readableSpacing ? '0.04em' : 'normal',
                opacity: 0.9,
                fontWeight: '400',
              }}>
                {PREVIEW_QUOTES[uiLanguage]?.text || PREVIEW_QUOTES.en.text}
              </p>

              <button
                type="button"
                style={{
                  alignSelf: 'flex-start',
                  border: accessibilityPrefs.highContrast ? (accessibilityPrefs.darkMode ? '3px solid #fff' : '3px solid #000') : '2px solid #bfdbfe',
                  borderBottom: accessibilityPrefs.highContrast ? (accessibilityPrefs.darkMode ? '5px solid #fff' : '5px solid #000') : '4px solid #60a5fa',
                  background: 'var(--surface-card, #fff)',
                  color: '#1d4ed8',
                  borderRadius: accessibilityPrefs.largeControls ? '12px' : '9px',
                  padding: accessibilityPrefs.largeControls ? '9px 16px' : '7px 12px',
                  fontFamily: 'var(--font-paper)',
                  fontSize: (accessibilityPrefs.largeText || readerPrefs?.largeText) ? '0.9rem' : '0.78rem',
                  cursor: 'pointer',
                  textDecoration: accessibilityPrefs.underlineLinks ? 'underline' : 'none',
                  fontWeight: '400',
                }}
              >
                {PREVIEW_QUOTES[uiLanguage]?.button || PREVIEW_QUOTES.en.button}
              </button>
            </div>
          </div>

          {/* B. Language Selector Card */}
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
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{t.language || 'LanguageSelector'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {appLanguageOptions.map(({ code, name }) => {
                const isActive = code === uiLanguage;
                return (
                  <motion.button
                    key={code}
                    onClick={() => setUiLanguage(code)}
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="sketchbook-border"
                    style={{
                      ...getOptionCardStyle(isActive),
                      fontFamily: 'var(--font-paper)',
                      fontSize: '0.88rem',
                      color: isActive ? 'var(--keycap-color)' : 'var(--text-secondary)',
                      padding: '10px 14px',
                      background: isActive ? 'var(--surface-card-active)' : 'var(--surface-card)',
                      border: isActive ? '2.5px solid #3b82f6' : '2.5px solid var(--surface-border)',
                      borderBottom: isActive ? '5px solid #2563eb' : '4px solid var(--surface-border)',
                      boxShadow: isActive ? '0 4px 8px rgba(59, 130, 246, 0.05)' : 'none',
                      justifyContent: 'flex-start',
                      width: '100%',
                      fontWeight: '400',
                    }}
                  >
                    {getLanguageVisual(code)}
                    <span style={{ flex: 1, textAlign: 'left', fontWeight: '400' }}>{name}</span>
                    {isActive && <Sparkle size={12} strokeWidth={3} style={{ color: '#3b82f6', marginLeft: 'auto' }} />}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* C. Keyboard Shortcuts Guide Card */}
          <div
            className="sketchbook-border"
            style={{
              background: 'var(--surface-card)',
              border: '3px solid #6366f1',
              borderBottom: '8px solid #4f46e5',
              padding: '20px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.02)',
            }}
          >
            <div
              className="washi-tape washi-tape--yellow"
              style={{
                top: '-14px',
                right: '24px',
                transform: 'rotate(2.5deg)',
                width: '74px',
                height: '22px',
                zIndex: 5,
              }}
            />
             <div style={PANEL_TITLE_STYLE}>
              <div className="panel-icon-box indigo-box no-override" style={getPanelIconBoxStyle('#c7d2fe', '#6366f1', '#e0e7ff', '#4f46e5')}>
                <Keyboard size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-paper)', fontWeight: '400' }}>{t.shortcuts || 'Keyboard Shortcuts'}</span>
            </div>

            <p style={{
              fontFamily: 'var(--font-paper)',
              fontSize: '0.84rem',
              color: '#4b5563',
              fontWeight: '400',
              margin: '0 0 4px 0',
              lineHeight: 1.4,
            }}>
              {t.shortcutsIntro || 'Use keyboard shortcuts to quickly navigate the notebook.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {shortcutRows.map((row) => (
                <div key={row.keyLabel} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'var(--surface-panel)',
                  border: '2px solid var(--surface-border)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                }} className="sketchbook-border">
                  <div style={KEYCAP_STYLE}>{row.keyLabel}</div>
                  <div style={{ fontSize: '1.15rem' }}>{row.icon}</div>
                  <div style={{
                    fontFamily: 'var(--font-paper)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.84rem',
                    fontWeight: '400',
                  }}>
                    {row.description}
                  </div>
                </div>
              ))}
            </div>
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

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <div
                className="sketchbook-border"
                style={{
                  background: 'var(--surface-panel)',
                  border: '2.5px solid #c4b5fd',
                  borderBottom: '5px solid #8b5cf6',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9', fontFamily: 'var(--font-paper)', fontSize: '0.96rem' }}>
                  {isInstalled ? <CheckCircle size={17} /> : <Download size={17} />}
                  <span>{isInstalled ? 'Installed app' : 'Install app'}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-paper)', fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {isInstalled
                    ? 'Skip and Loafer is installed. Open it from your home screen or app launcher.'
                    : canInstall
                      ? 'Add it to your device for a focused app window and easier offline access.'
                      : 'Use your browser menu to add this site to your home screen or install it as an app.'}
                </p>
                <motion.button
                  onClick={handleInstall}
                  disabled={!canInstall || isInstalled}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="sketchbook-border"
                  style={{
                    ...createPaperChipStyle({ borderColor: '#7c3aed', bottomColor: '#6d28d9', background: '#7c3aed', color: '#fff', radius: '14px', padding: '12px 20px' }),
                    width: '100%',
                    fontFamily: 'var(--font-paper)',
                    fontSize: '0.92rem',
                    fontWeight: '400',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: canInstall && !isInstalled ? 'pointer' : 'default',
                    border: 'none',
                    opacity: canInstall && !isInstalled ? 1 : 0.62,
                  }}
                >
                  {isInstalled ? <CheckCircle size={16} strokeWidth={2.5} /> : <Download size={16} strokeWidth={2.5} />}
                  {isInstalled ? 'Installed' : canInstall ? 'Install app' : 'Use browser install menu'}
                </motion.button>
              </div>

              <div
                className="sketchbook-border"
                style={{
                  background: 'var(--surface-panel)',
                  border: '2.5px solid #fbbf24',
                  borderBottom: '5px solid #d97706',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontFamily: 'var(--font-paper)', fontSize: '0.96rem' }}>
                  <WifiOff size={17} />
                  <span>Offline library</span>
                </div>
                <p style={{ fontFamily: 'var(--font-paper)', fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {isOnline
                    ? 'Prepare galleries, manga pages, and app files so the site keeps opening offline.'
                    : 'You are offline. Cached pages and images will still open when they have been prepared.'}
                </p>
                <div style={{ fontFamily: 'var(--font-paper)', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                  Cached files: {offlineStatus.cached} / {offlineStatus.total}
                  {storageEstimate ? ` · Storage used: ${formatBytes(storageEstimate.usage)}` : ''}
                </div>
                <div
                  aria-label={`Offline cache progress ${offlineProgress}%`}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={offlineProgress}
                  style={{
                    width: '100%',
                    height: '12px',
                    borderRadius: '999px',
                    border: '2px solid #fbbf24',
                    background: '#fffbeb',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: `${offlineProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #f59e0b, #22c55e)',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
                <div style={{ fontFamily: 'var(--font-paper)', fontSize: '0.76rem', color: '#92400e', lineHeight: 1.35 }}>
                  {offlineStatus.preparing
                    ? `Preparing ${offlineStatus.processed} of ${offlineStatus.total} files (${offlineProgress}%).`
                    : offlineProgress >= 100
                      ? 'Offline library prepared.'
                      : 'Progress appears here while the offline library is being prepared.'}
                </div>
                <motion.button
                  type="button"
                  role="checkbox"
                  aria-checked={keepPreparingOffline}
                  onClick={() => handleKeepPreparingChange(!keepPreparingOffline)}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...BUTTON_RESET_STYLE,
                    ...getOptionCardStyle(keepPreparingOffline),
                    padding: '10px 12px',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-paper)', fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                    Keep preparing automatically when the app is open
                  </span>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: '2px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: keepPreparingOffline ? '#3b82f6' : 'var(--surface-card, #fff)',
                    borderColor: keepPreparingOffline ? '#2563eb' : '#cbd5e1',
                    flexShrink: 0,
                  }}>
                    {keepPreparingOffline && <Check size={14} color="#fff" strokeWidth={3} />}
                  </div>
                </motion.button>
                <motion.button
                  onClick={handlePrepareOffline}
                  disabled={!isOnline || offlineStatus.preparing}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="sketchbook-border"
                  style={{
                    ...createPaperChipStyle({ borderColor: '#d97706', bottomColor: '#b45309', background: '#f59e0b', color: '#fff', radius: '14px', padding: '12px 20px' }),
                    width: '100%',
                    fontFamily: 'var(--font-paper)',
                    fontSize: '0.92rem',
                    fontWeight: '400',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: isOnline && !offlineStatus.preparing ? 'pointer' : 'default',
                    border: 'none',
                    opacity: isOnline && !offlineStatus.preparing ? 1 : 0.62,
                  }}
                >
                  <RefreshCw size={16} strokeWidth={2.5} />
                  {offlineStatus.preparing ? 'Preparing...' : 'Prepare offline library'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </PageLayout>
  );
};

export default SettingsPage;
