/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Star, Heart, X, Accessibility, Keyboard, Languages, ChevronUp } from 'lucide-react';

// Data
import { CHARACTER_DATA } from './data/characters';
import { COVER_IMAGES } from './data/coverImages';
import { CHAPTERS } from './data/chapters';

// Components
import CharacterSticker from './components/CharacterSticker';
import InteractiveShape from './components/InteractiveShape';
import MemoCard from './components/MemoCard';
import FloatingSparkle from './components/FloatingSparkle';
import PlannerPage from './components/PlannerPage';
import NavTabs from './components/NavTabs';
import ChaptersPage from './components/ChaptersPage';
import BlogPage from './components/BlogPage';
import MangaReader from './components/MangaReader';
import SyncPage from './components/SyncPage';
import BirthdayNotification from './components/BirthdayNotification';
import BirthdayPage from './components/BirthdayPage';
import ChangelogPopup from './components/ChangelogPopup';
import { useReadProgress } from './hooks/useReadProgress';
import { useSyncData } from './hooks/useSyncData';

const loadGalleryPage = () => import('./components/GalleryPage');
const GalleryPage = lazy(loadGalleryPage);
const ACCESSIBILITY_KEY = 'skip_accessibilityPrefs_v1';
const LANGUAGE_KEY = 'skip_uiLanguage_v1';
const SHORTCUT_STATS_KEY = 'skip_shortcutStats_v1';
const TAB_PAGES = ['home', 'chapters', 'gallery', 'blog', 'sync', 'birthdays'];

const UI_TEXT = {
  en: {
    languageName: 'English',
    accessibility: 'Accessibility',
    accessibilityOptions: 'Accessibility options',
    shortcuts: 'Shortcuts',
    keyboardHelp: 'Keyboard help',
    skipToContent: 'Skip to content',
    reduceMotion: 'Reduce motion',
    largeText: 'Larger text',
    largeControls: 'Bigger controls',
    highContrast: 'High contrast',
    readableSpacing: 'Readable spacing',
    underlineLinks: 'Underline links',
    reduceTransparency: 'Reduce transparency',
    simplifyVisuals: 'Simplify visuals',
    language: 'Language',
    tip: 'Tip: use 1..6 to jump tabs quickly.',
    usage: 'Shortcut uses this session: ',
    shortcutsIntro: 'Use these shortcuts for faster navigation:',
    close: 'Close',
    openTabPrefix: 'Open',
    tabSuffix: 'tab',
    tabs: {
      home: { label: 'Home' },
      chapters: { label: 'Chapters' },
      gallery: { label: 'Gallery', mobileLabel: 'Gallery' },
      blog: { label: 'Blog', mobileLabel: 'Blog' },
      sync: { label: 'Progress & Sync', mobileLabel: 'Sync' },
      birthdays: { label: 'Birthdays', mobileLabel: 'Birthdays' },
    },
  },
  es: {
    languageName: 'Español',
    accessibility: 'Accesibilidad',
    accessibilityOptions: 'Opciones de accesibilidad',
    shortcuts: 'Atajos',
    keyboardHelp: 'Ayuda de teclado',
    skipToContent: 'Saltar al contenido',
    reduceMotion: 'Reducir movimiento',
    largeText: 'Texto más grande',
    largeControls: 'Controles más grandes',
    highContrast: 'Alto contraste',
    readableSpacing: 'Espaciado legible',
    underlineLinks: 'Subrayar enlaces',
    reduceTransparency: 'Reducir transparencias',
    simplifyVisuals: 'Simplificar efectos visuales',
    language: 'Idioma',
    tip: 'Consejo: usa 1..6 para cambiar de pestaña.',
    usage: 'Usos de atajos en esta sesión: ',
    shortcutsIntro: 'Usa estos atajos para navegar más rápido:',
    close: 'Cerrar',
    openTabPrefix: 'Abrir',
    tabSuffix: 'pestaña',
    tabs: {
      home: { label: 'Inicio' },
      chapters: { label: 'Capítulos' },
      gallery: { label: 'Galería', mobileLabel: 'Galería' },
      blog: { label: 'Blog', mobileLabel: 'Blog' },
      sync: { label: 'Progreso y sincronización', mobileLabel: 'Sinc.' },
      birthdays: { label: 'Cumpleaños', mobileLabel: 'Cumpleaños' },
    },
  },
  pt: {
    languageName: 'Português',
    accessibility: 'Acessibilidade',
    accessibilityOptions: 'Opções de acessibilidade',
    shortcuts: 'Atalhos',
    keyboardHelp: 'Ajuda de teclado',
    skipToContent: 'Ir para o conteúdo',
    reduceMotion: 'Reduzir movimento',
    largeText: 'Texto maior',
    largeControls: 'Controles maiores',
    highContrast: 'Alto contraste',
    readableSpacing: 'Espaçamento legível',
    underlineLinks: 'Sublinhar links',
    reduceTransparency: 'Reduzir transparências',
    simplifyVisuals: 'Simplificar visuais',
    language: 'Idioma',
    tip: 'Dica: use 1..6 para trocar de aba.',
    usage: 'Usos de atalhos nesta sessão: ',
    shortcutsIntro: 'Use estes atalhos para navegar mais rápido:',
    close: 'Fechar',
    openTabPrefix: 'Abrir',
    tabSuffix: 'aba',
    tabs: {
      home: { label: 'Início' },
      chapters: { label: 'Capítulos' },
      gallery: { label: 'Galeria', mobileLabel: 'Galeria' },
      blog: { label: 'Blog', mobileLabel: 'Blog' },
      sync: { label: 'Progresso e sincronização', mobileLabel: 'Sync' },
      birthdays: { label: 'Aniversários', mobileLabel: 'Aniversários' },
    },
  },
  fr: {
    languageName: 'Français',
    accessibility: 'Accessibilité',
    accessibilityOptions: 'Options d’accessibilité',
    shortcuts: 'Raccourcis',
    keyboardHelp: 'Aide clavier',
    skipToContent: 'Aller au contenu',
    reduceMotion: 'Réduire les animations',
    largeText: 'Texte plus grand',
    largeControls: 'Commandes plus grandes',
    highContrast: 'Contraste élevé',
    readableSpacing: 'Espacement lisible',
    underlineLinks: 'Souligner les liens',
    reduceTransparency: 'Réduire les transparences',
    simplifyVisuals: 'Simplifier les effets visuels',
    language: 'Langue',
    tip: 'Astuce : utilisez 1..6 pour changer d’onglet.',
    usage: 'Utilisations des raccourcis cette session : ',
    shortcutsIntro: 'Utilisez ces raccourcis pour naviguer plus vite :',
    close: 'Fermer',
    openTabPrefix: 'Ouvrir',
    tabSuffix: 'onglet',
    tabs: {
      home: { label: 'Accueil' },
      chapters: { label: 'Chapitres' },
      gallery: { label: 'Galerie', mobileLabel: 'Galerie' },
      blog: { label: 'Blog', mobileLabel: 'Blog' },
      sync: { label: 'Progression et synchronisation', mobileLabel: 'Sync' },
      birthdays: { label: 'Anniversaires', mobileLabel: 'Anniversaires' },
    },
  },
  de: {
    languageName: 'Deutsch',
    accessibility: 'Barrierefreiheit',
    accessibilityOptions: 'Barrierefreiheitsoptionen',
    shortcuts: 'Kurzbefehle',
    keyboardHelp: 'Tastaturhilfe',
    skipToContent: 'Zum Inhalt springen',
    reduceMotion: 'Bewegung reduzieren',
    largeText: 'Größerer Text',
    largeControls: 'Größere Bedienelemente',
    highContrast: 'Hoher Kontrast',
    readableSpacing: 'Bessere Leseabstände',
    underlineLinks: 'Links unterstreichen',
    reduceTransparency: 'Transparenzen reduzieren',
    simplifyVisuals: 'Visuelle Effekte vereinfachen',
    language: 'Sprache',
    tip: 'Tipp: Nutze 1..6 zum schnellen Wechseln der Tabs.',
    usage: 'Shortcut-Nutzungen in dieser Sitzung: ',
    shortcutsIntro: 'Nutze diese Kurzbefehle für schnellere Navigation:',
    close: 'Schließen',
    openTabPrefix: 'Öffne',
    tabSuffix: 'Tab',
    tabs: {
      home: { label: 'Start' },
      chapters: { label: 'Kapitel' },
      gallery: { label: 'Galerie', mobileLabel: 'Galerie' },
      blog: { label: 'Blog', mobileLabel: 'Blog' },
      sync: { label: 'Fortschritt und Synchronisierung', mobileLabel: 'Sync' },
      birthdays: { label: 'Geburtstage', mobileLabel: 'Geburtstage' },
    },
  },
  it: {
    languageName: 'Italiano',
    accessibility: 'Accessibilità',
    accessibilityOptions: 'Opzioni di accessibilità',
    shortcuts: 'Scorciatoie',
    keyboardHelp: 'Guida tastiera',
    skipToContent: 'Vai al contenuto',
    reduceMotion: 'Riduci movimento',
    largeText: 'Testo più grande',
    largeControls: 'Controlli più grandi',
    highContrast: 'Alto contrasto',
    readableSpacing: 'Spaziatura leggibile',
    underlineLinks: 'Sottolinea i link',
    reduceTransparency: 'Riduci trasparenze',
    simplifyVisuals: 'Semplifica effetti visivi',
    language: 'Lingua',
    tip: 'Suggerimento: usa 1..6 per cambiare scheda rapidamente.',
    usage: 'Utilizzi scorciatoie in questa sessione: ',
    shortcutsIntro: 'Usa queste scorciatoie per navigare più velocemente:',
    close: 'Chiudi',
    openTabPrefix: 'Apri',
    tabSuffix: 'scheda',
    tabs: {
      home: { label: 'Home' },
      chapters: { label: 'Capitoli' },
      gallery: { label: 'Galleria', mobileLabel: 'Galleria' },
      blog: { label: 'Blog', mobileLabel: 'Blog' },
      sync: { label: 'Progresso e sincronizzazione', mobileLabel: 'Sync' },
      birthdays: { label: 'Compleanni', mobileLabel: 'Compleanni' },
    },
  },
  vi: {
    languageName: 'Tiếng Việt',
    accessibility: 'Trợ năng',
    accessibilityOptions: 'Tùy chọn trợ năng',
    shortcuts: 'Phím tắt',
    keyboardHelp: 'Trợ giúp bàn phím',
    skipToContent: 'Bỏ qua đến nội dung',
    reduceMotion: 'Giảm chuyển động',
    largeText: 'Chữ lớn hơn',
    largeControls: 'Nút điều khiển lớn hơn',
    highContrast: 'Tương phản cao',
    readableSpacing: 'Giãn cách dòng',
    underlineLinks: 'Gạch chân liên kết',
    reduceTransparency: 'Giảm độ trong suốt',
    simplifyVisuals: 'Đơn giản hóa giao diện',
    language: 'Ngôn ngữ',
    tip: 'Mẹo: dùng 1..6 để chuyển tab nhanh.',
    usage: 'Số lần dùng phím tắt trong phiên này: ',
    shortcutsIntro: 'Dùng các phím tắt này để điều hướng nhanh hơn:',
    close: 'Đóng',
    openTabPrefix: 'Mở',
    tabSuffix: 'tab',
    tabs: {
      home: { label: 'Trang chủ' },
      chapters: { label: 'Chương' },
      gallery: { label: 'Thư viện', mobileLabel: 'Thư viện' },
      blog: { label: 'Blog', mobileLabel: 'Blog' },
      sync: { label: 'Tiến độ và đồng bộ', mobileLabel: 'Đồng bộ' },
      birthdays: { label: 'Sinh nhật', mobileLabel: 'Sinh nhật' },
    },
  },
};

function App() {
  const DISCLAIMER_SEEN_KEY = 'skip_disclaimerSeen_v1';
  const { finished, finishedCount, readCounts, markFinished: rawMarkFinished, unmarkFinished, isFinished, getReadCount, incrementReadCount: rawIncrementReadCount, trackExternalLink, cancelExternalLink, reloadFromStorage, getRemainingCooldown, pendingLinks } = useReadProgress();
  const syncData = useSyncData(reloadFromStorage);
  const { pushNow } = syncData;

  // Wrap markFinished and incrementReadCount to trigger an immediate sync push
  const markFinished = useCallback((ch) => { rawMarkFinished(ch); pushNow(); }, [rawMarkFinished, pushNow]);
  const incrementReadCount = useCallback((ch) => { rawIncrementReadCount(ch); pushNow(); }, [rawIncrementReadCount, pushNow]);

  const [showUI, setShowUI] = useState(false);
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

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
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
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [showShortcutPanel, setShowShortcutPanel] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const isPopNavigatingRef = useRef(false);
  const historyReadyRef = useRef(false);
  const touchSwipeStartRef = useRef(null);
  const languageMenuRef = useRef(null);
  const mainScrollRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [subtabShortcut, setSubtabShortcut] = useState({ key: null, token: 0 });
  const [uiLanguage, setUiLanguage] = useState(() => {
    try {
      return localStorage.getItem(LANGUAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
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
    };
  });

  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onPopState = (event) => {
      const statePage = event.state?.skipApp ? event.state.page : null;
      const hashPage = window.location.hash.replace('#', '');
      const nextPage = TAB_PAGES.includes(statePage)
        ? statePage
        : (TAB_PAGES.includes(hashPage) ? hashPage : null);

      if (!nextPage || nextPage === activePage) return;
      isPopNavigatingRef.current = true;
      setActivePage(nextPage);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activePage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = `#${activePage}`;
    const state = { skipApp: true, page: activePage };

    if (!historyReadyRef.current) {
      window.history.replaceState(state, '', hash);
      historyReadyRef.current = true;
      return;
    }

    if (isPopNavigatingRef.current) {
      isPopNavigatingRef.current = false;
      if (window.location.hash !== hash) {
        window.history.replaceState(state, '', hash);
      }
      return;
    }

    const current = window.history.state;
    const alreadyCurrent = current?.skipApp && current.page === activePage && window.location.hash === hash;
    if (!alreadyCurrent) {
      window.history.pushState(state, '', hash);
    }
  }, [activePage]);

  useEffect(() => { localStorage.setItem('skip_activePage', activePage); }, [activePage]);
  useEffect(() => {
    if (readerChapter) localStorage.setItem('skip_readerChapter', JSON.stringify(readerChapter));
    else localStorage.removeItem('skip_readerChapter');
  }, [readerChapter]);

  useEffect(() => {
    try {
      localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(accessibilityPrefs));
    } catch {
      // ignore storage failures
    }
  }, [accessibilityPrefs]);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_KEY, uiLanguage);
    } catch {
      // ignore storage failures
    }
  }, [uiLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem(SHORTCUT_STATS_KEY, JSON.stringify(shortcutStats));
    } catch {
      // ignore storage failures
    }
  }, [shortcutStats]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-a11y-reduce-motion', accessibilityPrefs.reduceMotion ? '1' : '0');
    root.setAttribute('data-a11y-large-text', accessibilityPrefs.largeText ? '1' : '0');
    root.setAttribute('data-a11y-large-controls', accessibilityPrefs.largeControls ? '1' : '0');
    root.setAttribute('data-a11y-high-contrast', accessibilityPrefs.highContrast ? '1' : '0');
    root.setAttribute('data-a11y-readable-spacing', accessibilityPrefs.readableSpacing ? '1' : '0');
    root.setAttribute('data-a11y-underline-links', accessibilityPrefs.underlineLinks ? '1' : '0');
    root.setAttribute('data-a11y-reduce-transparency', accessibilityPrefs.reduceTransparency ? '1' : '0');
    root.setAttribute('data-a11y-simplify-visuals', accessibilityPrefs.simplifyVisuals ? '1' : '0');
    root.setAttribute('lang', uiLanguage);
  }, [accessibilityPrefs, uiLanguage]);

  useEffect(() => {
    if (!showAccessibilityPanel) setShowLanguageMenu(false);
  }, [showAccessibilityPanel]);

  useEffect(() => {
    if (!showLanguageMenu) return;

    const onPointerDown = (event) => {
      if (!languageMenuRef.current) return;
      if (!languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [showLanguageMenu]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const targetTag = event.target?.tagName;
      const isTypingTarget = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT' || event.target?.isContentEditable;
      const key = event.key?.toLowerCase();

      if (event.key === 'Escape') {
        setShowAccessibilityPanel(false);
        setShowShortcutPanel(false);
        setShowLanguageMenu(false);
        return;
      }

      if (isTypingTarget) return;

      let usedShortcut = false;

      if (event.key === '1') { setActivePage('home'); usedShortcut = true; }
      if (event.key === '2') { setActivePage('chapters'); usedShortcut = true; }
      if (event.key === '3') { setActivePage('gallery'); usedShortcut = true; }
      if (event.key === '4') { setActivePage('blog'); usedShortcut = true; }
      if (event.key === '5') { setActivePage('sync'); usedShortcut = true; }
      if (event.key === '6') { setActivePage('birthdays'); usedShortcut = true; }

      if (!event.altKey && !usedShortcut) {
        const subtabKeys = ['q', 'e'];
        if (subtabKeys.includes(key) && ['chapters', 'gallery', 'sync'].includes(activePage)) {
          setSubtabShortcut((prev) => ({ key, token: prev.token + 1 }));
          usedShortcut = true;
        }
      }

      if (event.altKey && key === 'a') { setShowAccessibilityPanel((prev) => !prev); usedShortcut = true; }
      if (event.altKey && key === 'k') { setShowShortcutPanel((prev) => !prev); usedShortcut = true; }

      if (usedShortcut) {
        event.preventDefault();
        setShortcutStats((prev) => ({ ...prev, usageCount: prev.usageCount + 1 }));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePage]);

  useEffect(() => {
    if (shortcutStats.coachSeen || shortcutStats.usageCount < 6) return;
    setShowShortcutPanel(true);
    setShortcutStats((prev) => ({ ...prev, coachSeen: true }));
  }, [shortcutStats]);

  const toggleAccessibilityPref = useCallback((key) => {
    setAccessibilityPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleMainTouchStart = useCallback((event) => {
    if (event.touches.length !== 1) {
      touchSwipeStartRef.current = null;
      return;
    }

    const target = event.target;
    if (target?.closest?.('button, a, input, textarea, select, label, [role="button"], [role="link"], [data-no-tab-swipe="1"]')) {
      touchSwipeStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchSwipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleMainTouchEnd = useCallback((event) => {
    if (!touchSwipeStartRef.current || event.changedTouches.length !== 1) {
      touchSwipeStartRef.current = null;
      return;
    }

    if (readerChapter) {
      touchSwipeStartRef.current = null;
      return;
    }

    const touch = event.changedTouches[0];
    const start = touchSwipeStartRef.current;
    touchSwipeStartRef.current = null;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const elapsed = Date.now() - start.time;

    if (elapsed > 650) return;
    if (absX < 56) return;
    if (absX < absY * 1.25) return;

    const currentIndex = TAB_PAGES.indexOf(activePage);
    if (currentIndex === -1) return;

    if (currentIndex === 0) {
      setActivePage(TAB_PAGES[1]);
      return;
    }

    if (currentIndex === TAB_PAGES.length - 1) {
      setActivePage(TAB_PAGES[TAB_PAGES.length - 2]);
      return;
    }

    if (dx < 0) {
      const previousIndex = Math.max(0, currentIndex - 1);
      if (previousIndex !== currentIndex) setActivePage(TAB_PAGES[previousIndex]);
      return;
    }

    const nextIndex = Math.min(TAB_PAGES.length - 1, currentIndex + 1);
    if (nextIndex !== currentIndex) setActivePage(TAB_PAGES[nextIndex]);
  }, [readerChapter, activePage]);

  // Read Chapter Handlers
  const activeChapterIndex = readerChapter ? CHAPTERS.findIndex(c => c.number === readerChapter.number) : -1;
  const nextChapter = activeChapterIndex !== -1 && activeChapterIndex < CHAPTERS.length - 1 ? CHAPTERS[activeChapterIndex + 1] : null;
  const hasNextChapter = !!(nextChapter && nextChapter.pages && nextChapter.pages.length > 0);
  const hasPrevChapter = activeChapterIndex > 0;

  const handleNextChapter = useCallback(() => {
    if (hasNextChapter) setReaderChapter(CHAPTERS[activeChapterIndex + 1]);
  }, [hasNextChapter, activeChapterIndex]);

  const handlePrevChapter = useCallback(() => {
    if (hasPrevChapter) setReaderChapter(CHAPTERS[activeChapterIndex - 1]);
  }, [hasPrevChapter, activeChapterIndex]);

  const handlePositionUpdate = useCallback((id, pos) => {
    stickerPositionsRef.current[id] = pos;
  }, []);

  useEffect(() => {
    let rafId = null;

    const handleResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const width = window.innerWidth;
        const height = window.innerHeight;
        setWindowSize((prev) => {
          if (prev.width === width && prev.height === height) return prev;
          return { width, height };
        });
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
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

  useEffect(() => {
    const timer = setTimeout(() => setShowUI(true), COVER_IMAGES.length * 70 + 500);
    return () => clearTimeout(timer);
  }, []);

  // Track main scroll position for scroll-to-top button
  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setShowScrollTop(el.scrollTop > 300);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener('scroll', onScroll);
    };
  }, [showUI]);

  const scrollToTop = useCallback(() => {
    const el = mainScrollRef.current;
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({ top: 0, behavior: 'smooth' });
      window.setTimeout(() => {
        if ((el.scrollTop || 0) > 1) {
          el.scrollTop = 0;
        }
      }, 320);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 320);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;
    let timeoutId;
    let idleId;

    const prefetch = () => {
      if (cancelled || activePage === 'gallery') return;
      loadGalleryPage().catch(() => {});
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(prefetch, { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(prefetch, 900);
    }

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [activePage]);

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

      {/* Disclaimer Popup */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDisclaimer}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
              style={{
                background: 'var(--paper-white)',
                padding: '24px', borderRadius: '16px',
                border: '3px solid var(--line-blue)',
                boxShadow: '8px 8px 0 rgba(0,0,0,0.1)',
                maxWidth: '450px', width: '100%',
                position: 'relative', textAlign: 'center'
              }}
            >
              <button
                onClick={closeDisclaimer}
                aria-label="Close disclaimer"
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>

              <Heart size={32} style={{ color: 'var(--pop-pink)', margin: '0 auto 12px auto' }} />

              <h2 style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#374151', fontSize: '1.4rem', marginBottom: '12px', marginTop: 0, fontWeight: 'normal' }}>
                Fan-made website
              </h2>

              <p style={{ fontFamily: 'var(--font-hand)', color: '#4b5563', fontSize: '1rem', lineHeight: 1.5, marginBottom: '20px' }}>
                This is a fan-made website and is not intended to promote any translation! Please support the official translation by purchasing volumes in your local country if available, or buy Japanese volumes and chapters on Comic DAYS.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeDisclaimer}
                aria-label="Confirm disclaimer"
                style={{
                  background: 'var(--pop-yellow)', border: '2px solid #eab308',
                  color: '#854d0e', padding: '8px 24px', borderRadius: '9999px',
                  fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: '1.1rem',
                  cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                I understand
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Morphing Shapes */}
      {!accessibilityPrefs.simplifyVisuals && (
        <>
          <InteractiveShape color="var(--pop-pink)" size="200px" initialTop="3%" initialLeft="5%" index={0} />
          <InteractiveShape color="var(--pop-blue)" size="180px" initialTop="55%" initialLeft="3%" index={1} />
          {!isMobile && (
            <>
              <InteractiveShape color="var(--pop-yellow)" size="220px" initialTop="5%" initialLeft="78%" index={2} />
              <InteractiveShape color="var(--pop-green)" size="190px" initialTop="60%" initialLeft="82%" index={3} />
            </>
          )}
          {!isMobile && (
            <>
              <InteractiveShape color="var(--pop-pink)" size="140px" initialTop="35%" initialLeft="1%" index={4} />
              <InteractiveShape color="var(--pop-blue)" size="160px" initialTop="25%" initialLeft="90%" index={5} />
            </>
          )}
        </>
      )}

      {/* Character Stickers - Random positions */}
      {!accessibilityPrefs.simplifyVisuals && CHARACTER_DATA.map((char, index) => (
        <CharacterSticker
          key={char.id}
          character={char}
          index={index}
          isMobile={isMobile}
          activePage={activePage}
          allPositions={stickerPositionsRef.current}
          onPositionUpdate={handlePositionUpdate}
          sidePreference={stickerLayoutById[char.id]?.side}
          sideRank={stickerLayoutById[char.id]?.rank}
          sideCount={stickerLayoutById[char.id]?.count}
        />
      ))}

      {/* Memo Cards */}
      {!accessibilityPrefs.simplifyVisuals && !isMobile && activePage === 'home' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, pointerEvents: 'none' }}>
          {COVER_IMAGES.map((src, index) => (
            <MemoCard
              key={`${src}-${index}`}
              src={src}
              index={index}
              initialX={cardPositions[index].x}
              initialY={cardPositions[index].y}
              initialRotation={cardPositions[index].rotation}
            />
          ))}
        </div>
      )}

      {/* Main UI */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            ref={mainScrollRef}
            className="hide-scrollbar"
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
              padding: isMobile ? '56px 8px 40px 8px' : '40px',
              pointerEvents: 'auto'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Floating Sparkles - Desktop */}
            {!isMobile && !accessibilityPrefs.simplifyVisuals && (
              <>
                <FloatingSparkle top="10%" left="5%" delay={0} color="var(--pop-yellow)">
                  <Star size={36} fill="currentColor" />
                </FloatingSparkle>
                <FloatingSparkle top="15%" right="8%" delay={0.5} color="var(--pop-pink)">
                  <Heart size={30} fill="currentColor" />
                </FloatingSparkle>
              </>
            )}

            {/* Spacer for safe centering */}
            <div style={{ flexGrow: 1, minHeight: isMobile ? '24px' : '20px' }} />

            {/* Container to handle stacking contexts for tabs and planner */}
            <div style={{
              position: 'relative',
              scrollMarginTop: '60px',
              width: '100%',
              maxWidth: isMobile ? '100%' : '1200px',
              minHeight: isMobile ? 0 : 'min-content',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'auto',
              flex: '0 0 auto',
              flexShrink: 0
            }}>
              {/* Bookmark Nav Tabs */}
              <NavTabs
                activePage={activePage}
                onPageChange={setActivePage}
                isMobile={isMobile}
                labelsById={t.tabs}
                openTabPrefix={t.openTabPrefix}
                tabSuffix={t.tabSuffix}
              />

              {/* Planner */}
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
                  zIndex: 10,
                  pointerEvents: 'auto',
                  minHeight: isMobile ? 0 : undefined,
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Page Content */}
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
                      <PlannerPage isMobile={isMobile} uiLanguage={uiLanguage} />
                    </motion.div>
                  )}

                  {activePage === 'chapters' && (
                    <motion.div
                      key="chapters"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--paper-white)',
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--line-blue) 32px)',
                        backgroundSize: '100% 32px',
                        borderRadius: '4px',
                        flex: 1, display: 'flex', flexDirection: 'column'
                      }}
                    >
                      <ChaptersPage isMobile={isMobile} uiLanguage={uiLanguage} subtabShortcut={subtabShortcut} onReadChapter={(ch) => setReaderChapter(ch)} isFinished={isFinished} trackExternalLink={trackExternalLink} cancelExternalLink={cancelExternalLink} markFinished={markFinished} unmarkFinished={unmarkFinished} getReadCount={getReadCount} incrementReadCount={incrementReadCount} getRemainingCooldown={getRemainingCooldown} pendingLinks={pendingLinks} />
                    </motion.div>
                  )}

                  {activePage === 'gallery' && (
                    <motion.div
                      key="gallery"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--paper-white)',
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--line-blue) 32px)',
                        backgroundSize: '100% 32px',
                        borderRadius: '4px',
                        flex: 1, display: 'flex', flexDirection: 'column'
                      }}
                    >
                      <Suspense
                        fallback={(
                          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                            <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.95rem' : '1rem', color: '#9ca3af' }}>
                              Loading gallery...
                            </span>
                          </div>
                        )}
                      >
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
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--paper-white)',
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--line-blue) 32px)',
                        backgroundSize: '100% 32px',
                        borderRadius: '4px',
                        flex: 1, display: 'flex', flexDirection: 'column'
                      }}
                    >
                      <BlogPage isMobile={isMobile} uiLanguage={uiLanguage} />
                    </motion.div>
                  )}

                  {activePage === 'sync' && (
                    <motion.div
                      key="sync"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--paper-white)',
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--line-blue) 32px)',
                        backgroundSize: '100% 32px',
                        borderRadius: '4px',
                        flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row'
                      }}
                    >
                      <SyncPage isMobile={isMobile} uiLanguage={uiLanguage} subtabShortcut={subtabShortcut} finishedCount={finishedCount} finished={finished} readCounts={readCounts} reloadFromStorage={reloadFromStorage} onReadChapter={(ch) => setReaderChapter(ch)} trackExternalLink={trackExternalLink} cancelExternalLink={cancelExternalLink} markFinished={markFinished} unmarkFinished={unmarkFinished} incrementReadCount={incrementReadCount} getRemainingCooldown={getRemainingCooldown} pendingLinks={pendingLinks} syncData={syncData} />
                    </motion.div>
                  )}

                  {activePage === 'birthdays' && (
                    <motion.div
                      key="birthdays"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--paper-white)',
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--line-blue) 32px)',
                        backgroundSize: '100% 32px',
                        borderRadius: '4px',
                        flex: 1, display: 'flex', flexDirection: 'column'
                      }}
                    >
                      <BirthdayPage isMobile={isMobile} uiLanguage={uiLanguage} reduceMotion={accessibilityPrefs.reduceMotion} simplifyVisuals={accessibilityPrefs.simplifyVisuals} />
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            </div>

            {/* Spacer for safe centering */}
            <div style={{ flexGrow: 1, minHeight: isMobile ? '8px' : '20px' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Changelog Popup */}
      <ChangelogPopup isMobile={isMobile} uiLanguage={uiLanguage} />

      {/* Birthday Notification */}
      <BirthdayNotification isMobile={isMobile} uiLanguage={uiLanguage} />

      {/* Copyright */}
      <div style={{ position: 'fixed', bottom: '8px', right: '14px', zIndex: 1000, fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '0.7rem', opacity: 0.6 }}>
        © Takamatsu Misaki / KODANSHA
      </div>

      {/* Global Scroll-to-Top Button */}
      <AnimatePresence>
        {showScrollTop && !readerChapter && activePage !== 'blog' && (
          <motion.button
            key="scroll-top"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{
              position: 'fixed',
              right: isMobile ? '14px' : '28px',
              bottom: isMobile ? '98px' : '108px',
              zIndex: 1100,
              border: '2px solid #d1d5db',
              background: '#fff',
              color: '#374151',
              borderRadius: '9999px',
              padding: isMobile ? '14px 18px' : '14px 20px',
              fontFamily: 'var(--font-hand)',
              fontWeight: 'bold',
              fontSize: isMobile ? '0.98rem' : '1.05rem',
              boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <ChevronUp size={isMobile ? 20 : 22} /> Top
          </motion.button>
        )}
      </AnimatePresence>

      {/* Accessibility Quick Controls */}
      <div style={{ position: 'fixed', left: '10px', ...(readerChapter ? { top: '10px' } : { bottom: '10px' }), zIndex: 1100, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', transition: 'top 0.3s ease, bottom 0.3s ease' }}>
        <button
          onClick={() => setShowAccessibilityPanel((prev) => !prev)}
          aria-label={t.accessibilityOptions}
          aria-expanded={showAccessibilityPanel}
          style={{
            background: 'white',
            border: '2px solid var(--line-blue)',
            borderRadius: '9999px',
            padding: '8px 12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#374151',
            fontFamily: 'var(--font-hand)',
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}
        >
          <Accessibility size={16} />
          {t.accessibility}
        </button>

        {!isMobile && (
          <button
            onClick={() => setShowShortcutPanel((prev) => !prev)}
            aria-label={t.keyboardHelp}
            aria-expanded={showShortcutPanel}
            style={{
              background: 'white',
              border: '2px solid var(--line-blue)',
              borderRadius: '9999px',
              padding: '8px 12px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#374151',
              fontFamily: 'var(--font-hand)',
              fontWeight: 'bold',
              fontSize: '0.9rem',
            }}
          >
            <Keyboard size={16} />
            {t.shortcuts}
          </button>
        )}

        {showAccessibilityPanel && (
          <div
            role="dialog"
            aria-label={t.accessibilityOptions}
            style={{
              background: 'white',
              border: '2px solid var(--line-blue)',
              borderRadius: '12px',
              padding: '10px',
              boxShadow: '0 8px 18px rgba(0,0,0,0.16)',
              minWidth: isMobile ? '220px' : '250px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {[
              { key: 'reduceMotion', label: t.reduceMotion || UI_TEXT.en.reduceMotion },
              { key: 'largeText', label: t.largeText || UI_TEXT.en.largeText },
              { key: 'largeControls', label: t.largeControls || UI_TEXT.en.largeControls },
              { key: 'highContrast', label: t.highContrast || UI_TEXT.en.highContrast },
              { key: 'readableSpacing', label: t.readableSpacing || UI_TEXT.en.readableSpacing },
              { key: 'underlineLinks', label: t.underlineLinks || UI_TEXT.en.underlineLinks },
              { key: 'reduceTransparency', label: t.reduceTransparency || UI_TEXT.en.reduceTransparency },
              { key: 'simplifyVisuals', label: t.simplifyVisuals || UI_TEXT.en.simplifyVisuals },
            ].map((option) => (
              <label
                key={option.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  fontFamily: 'var(--font-hand)',
                  color: '#374151',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                }}
              >
                <span>{option.label}</span>
                <input
                  type="checkbox"
                  checked={!!accessibilityPrefs[option.key]}
                  onChange={() => toggleAccessibilityPref(option.key)}
                  aria-label={option.label}
                />
              </label>
            ))}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                fontFamily: 'var(--font-hand)',
                color: '#374151',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Languages size={14} />
                {t.language}
              </span>
              <div ref={languageMenuRef} style={{ position: 'relative', minWidth: '128px' }}>
                <button
                  type="button"
                  onClick={() => setShowLanguageMenu((prev) => !prev)}
                  aria-label={t.language}
                  aria-haspopup="listbox"
                  aria-expanded={showLanguageMenu}
                  style={{
                    width: '100%',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontFamily: 'var(--font-hand)',
                    color: '#374151',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <span>{UI_TEXT[uiLanguage]?.languageName || UI_TEXT.en.languageName}</span>
                  <span aria-hidden="true" style={{ fontSize: '0.8rem', color: '#6b7280' }}>{showLanguageMenu ? '▴' : '▾'}</span>
                </button>

                <AnimatePresence>
                  {showLanguageMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      role="listbox"
                      aria-label={t.language}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 'calc(100% + 6px)',
                        zIndex: 1200,
                        background: '#fff',
                        border: '1.5px solid #d1d5db',
                        borderRadius: '10px',
                        boxShadow: '0 8px 18px rgba(0,0,0,0.16)',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      {Object.keys(UI_TEXT).map((lang) => {
                        const selected = lang === uiLanguage;
                        return (
                          <button
                            key={lang}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setUiLanguage(lang);
                              setShowLanguageMenu(false);
                            }}
                            style={{
                              textAlign: 'left',
                              border: selected ? '1.5px solid var(--line-blue)' : '1.5px solid transparent',
                              borderRadius: '8px',
                              background: selected ? '#eef6ff' : '#fff',
                              color: '#374151',
                              padding: '6px 8px',
                              fontFamily: 'var(--font-hand)',
                              fontWeight: selected ? 'bold' : 'normal',
                              cursor: 'pointer',
                            }}
                          >
                            {UI_TEXT[lang].languageName}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-hand)', color: '#6b7280', fontSize: '0.75rem', lineHeight: 1.3 }}>
              {t.tip}
            </div>
          </div>
        )}

        {showShortcutPanel && (
          <div
            role="dialog"
            aria-label={t.keyboardHelp}
            style={{
              background: 'white',
              border: '2px solid var(--line-blue)',
              borderRadius: '12px',
              padding: '10px',
              boxShadow: '0 8px 18px rgba(0,0,0,0.16)',
              minWidth: isMobile ? '220px' : '280px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-main)', color: '#374151', fontSize: '1rem' }}>{t.shortcuts}</div>
            <div style={{ fontFamily: 'var(--font-hand)', color: '#4b5563', fontSize: '0.88rem', lineHeight: 1.3 }}>
              {t.shortcutsIntro}
            </div>
            <div style={{ fontFamily: 'var(--font-hand)', color: '#374151', fontSize: '0.86rem', lineHeight: 1.4 }}>
              <div><strong>1..6</strong> — {t.tip}</div>
              <div><strong>Q / E</strong> — Previous / next subtab</div>
              <div><strong>Alt+A</strong> — {t.accessibility}</div>
              <div><strong>Alt+K</strong> — {t.shortcuts}</div>
              <div><strong>Esc</strong> — {t.close}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-hand)', color: '#6b7280', fontSize: '0.76rem' }}>
              {t.usage}{shortcutStats.usageCount}
            </div>
          </div>
        )}
      </div>

      {/* Manga Reader Overlay */}
      <AnimatePresence>
        {readerChapter && readerChapter.pages && (
          <MangaReader
            key={`reader-${readerChapter.number}`}
            chapter={readerChapter}
            pages={readerChapter.pages}
            onClose={() => setReaderChapter(null)}
            onNextChapter={hasNextChapter ? handleNextChapter : undefined}
            onPrevChapter={hasPrevChapter ? handlePrevChapter : undefined}
            isMobile={isMobile}
            onChapterFinished={markFinished}
            getRemainingCooldown={getRemainingCooldown}
          />
        )}
      </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

export default App;
