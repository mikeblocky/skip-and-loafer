import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Pin } from 'lucide-react';
import { CHAPTERS, SIDE_WORKS, VOLUMES, VOL_COLORS } from '../data/chapters';
import { JELLY_TAP, JELLY_HOVER, SQUASH_TRANSITION } from '../components/shared/animationPresets';
import { triggerHaptic } from '../utils/haptics';
import MobileChaptersTab from '../features/chapters/tabs/MobileChaptersTab';
import DesktopChaptersTab from '../features/chapters/tabs/DesktopChaptersTab';
import SideWorksTab from '../features/chapters/tabs/SideWorksTab';
import {
  ChapterRow as SharedChapterRow,
  NavBtn as SharedNavBtn,
  VolSelector as SharedVolSelector,
} from '../features/chapters/chaptersSharedComponents';
import { useSubtabShortcutNavigation } from '../hooks/shared/useSubtabShortcutNavigation';
import { buildNativeLink, isNativePreOrderVolume } from '../features/chapters/chapterStoreLinks';
import { NOTE_PALETTES, getReadTier } from '../features/chapters/chapterTierConfig';
import {
  UI_TEXT,
  COUNTRY_CACHE_KEY,
  COUNTRY_CACHE_TTL_MS,
  getCountryPluralSuffix,
  getVolumeShortWord,
  getVolumeTitle,
  getLocaleRegion,
  getNativeLanguageName,
  getNativeVolumeLabel,
} from '../features/chapters/chapterLanguageContent';

const ChapterRow = (props) => (
  <SharedChapterRow
    {...props}
    getReadTierFn={getReadTier}
    notePalettes={NOTE_PALETTES}
  />
);

const NavBtn = (props) => <SharedNavBtn {...props} />;

const VolSelector = (props) => (
  <SharedVolSelector
    {...props}
    getVolumeShortWordFn={getVolumeShortWord}
  />
);

const MobileChapters = (props) => (
  <MobileChaptersTab
    {...props}
    getVolumeTitleFn={getVolumeTitle}
    getVolumeShortWordFn={getVolumeShortWord}
    getCountryPluralSuffixFn={getCountryPluralSuffix}
    VolSelectorComponent={VolSelector}
    NavBtnComponent={NavBtn}
    ChapterRowComponent={ChapterRow}
  />
);

const DesktopChapters = (props) => (
  <DesktopChaptersTab
    {...props}
    getVolumeTitleFn={getVolumeTitle}
    getVolumeShortWordFn={getVolumeShortWord}
    getCountryPluralSuffixFn={getCountryPluralSuffix}
    VolSelectorComponent={VolSelector}
    NavBtnComponent={NavBtn}
    ChapterRowComponent={ChapterRow}
  />
);

const SUBTABS = ['main', 'side'];

const ChaptersSubtabSelector = ({ isMobile, activeSubtab, setActiveSubtab, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const tabs = [
    { id: 'main', label: t.mainStory || 'Main story', color: '#0ea5e9', border: '#0284c7' },
    { id: 'side', label: t.sideWorks || 'Side works', color: '#f43f5e', border: '#e11d48' },
  ];

  const currentTab = tabs.find(tab => tab.id === activeSubtab) || tabs[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (id) => {
    triggerHaptic('tap');
    setActiveSubtab(id);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 100, minWidth: isMobile ? '200px' : '220px' }}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98, y: 1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%',
          padding: isMobile ? '12px 20px' : '14px 24px',
          background: '#ffffff',
          color: currentTab.color,
          border: `3px solid ${currentTab.color}`,
          borderBottom: `8px solid ${currentTab.color}`,
          borderRadius: '16px',
          fontFamily: '"Sniglet", "Coming Soon", cursive',
          fontSize: isMobile ? '1.1rem' : '1.15rem',
          fontWeight: '400',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <span>{currentTab.label}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 15, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '3px solid #e5e7eb',
              borderBottom: '8px solid #e5e7eb',
              borderRadius: '20px',
              padding: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeSubtab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleSelect(tab.id)}
                  whileHover={{ x: 4, background: isActive ? `${tab.color}15` : '#f9fafb' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '100%',
                    padding: '14px 20px',
                    background: isActive ? `${tab.color}10` : 'transparent',
                    color: isActive ? tab.color : '#64748b',
                    border: 'none',
                    borderRadius: '16px',
                    fontFamily: '"Sniglet", "Coming Soon", cursive',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontWeight: '400',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChaptersPage = ({ isMobile, uiLanguage = 'en', subtabShortcut, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, markFinished, unmarkFinished, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const chaptersTitle = uiLanguage === 'ja' ? 'チャプター' : (uiLanguage === 'es' ? 'Capítulos' : (uiLanguage === 'pt' ? 'Capítulos' : (uiLanguage === 'fr' ? 'Chapitres' : (uiLanguage === 'de' ? 'Kapitel' : (uiLanguage === 'it' ? 'Capitoli' : 'Chapters')))));
  const [countryCode, setCountryCode] = useState(null);
  const [activeSubtab, _setActiveSubtab] = useState(() => {
    const saved = localStorage.getItem('skip_chaptersSubtab');
    return saved === 'side' ? 'side' : 'main';
  });

  const setActiveSubtab = (valueOrFn) => {
    _setActiveSubtab((prev) => {
      const next = typeof valueOrFn === 'function' ? valueOrFn(prev) : valueOrFn;
      localStorage.setItem('skip_chaptersSubtab', next);
      return next;
    });
  };

  const isLikelyPreOrderLink = (url) =>
    /pre[-\s]?order|pré[-\s]?venda|vorbestell|preordina|reservar|précommander/i.test(String(url || ''));

  useEffect(() => {
    let cancelled = false;

    const setAndCacheCountry = (code) => {
      if (!code || cancelled) return;
      setCountryCode(code);
      try {
        localStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify({ code, ts: Date.now() }));
      } catch {
        // Ignore storage write failures.
      }
    };

    try {
      const cached = JSON.parse(localStorage.getItem(COUNTRY_CACHE_KEY) || '{}');
      const cachedCode = (cached?.code || '').toUpperCase();
      const cachedTs = Number(cached?.ts || 0);
      if (/^[A-Z]{2}$/.test(cachedCode) && Date.now() - cachedTs < COUNTRY_CACHE_TTL_MS) {
        setCountryCode(cachedCode);
        return () => {
          cancelled = true;
        };
      }
    } catch {
      // Ignore malformed cache payloads.
    }

    const resolveCountry = async () => {
      try {
        const response = await fetch('/api/geo/country', { cache: 'no-store' });
        if (!response.ok) throw new Error('geo api failed');
        const data = await response.json();
        const code = (data?.countryCode || '').toUpperCase();
        if (/^[A-Z]{2}$/.test(code)) {
          setAndCacheCountry(code);
          return;
        }
      } catch {
        // Ignore geo lookup failures and fallback to locale region.
      }

      const localeRegion = getLocaleRegion();
      setAndCacheCountry(localeRegion);
    };

    resolveCountry();
    return () => {
      cancelled = true;
    };
  }, []);

  const [activeVol, _setActiveVol] = useState(() => {
    const saved = localStorage.getItem('skip_activeVol');
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (!Number.isNaN(idx) && idx >= 0 && idx < VOLUMES.length) return idx;
    }
    return VOLUMES.length - 1;
  });

  const setActiveVol = (valOrFn) => {
    _setActiveVol((prev) => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      localStorage.setItem('skip_activeVol', String(next));
      return next;
    });
  };

  const volume = VOLUMES[activeVol];
  const volChapters = volume.chapters.map((num) => CHAPTERS.find((c) => c.number === num)).filter(Boolean);
  const volColor = VOL_COLORS[volume.number] || '#9ca3af';
  const nativePurchaseUrl = buildNativeLink(countryCode, volume.number);
  const enIsPreOrder = Boolean(volume.inProgress || isLikelyPreOrderLink(volume.purchaseUrl));
  const jpIsPreOrder = Boolean(volume.inProgress || isLikelyPreOrderLink(volume.purchaseUrlJp));
  const nativeIsPreOrder = Boolean(volume.inProgress || isNativePreOrderVolume(countryCode, volume.number));
  const nativeLanguageName = getNativeLanguageName(countryCode, uiLanguage);
  const nativeVolumeLabel = getNativeVolumeLabel(uiLanguage, nativeLanguageName, t, nativeIsPreOrder);
  const enVolumeLabel = enIsPreOrder ? t.preOrderEnVolume : t.buyEnVolume;
  const jpVolumeLabel = jpIsPreOrder ? t.preOrderJpVolume : t.buyJpVolume;
  const enShortLabel = enIsPreOrder ? t.preOrderEN : t.buyEN;
  const jpShortLabel = jpIsPreOrder ? t.preOrderJP : t.buyJP;

  const goPrev = () => setActiveVol((prev) => Math.max(0, prev - 1));
  const goNext = () => setActiveVol((prev) => Math.min(VOLUMES.length - 1, prev + 1));

  const unreadCount = useMemo(() => {
    // Only count main-story chapters that are available for reading.
    const isMainStoryChapter = (chapter) => chapter.category === 'main' || !chapter.category;
    const totalAvailable = CHAPTERS.filter((chapter) => isMainStoryChapter(chapter) && (chapter.links?.en || chapter.pages)).length;
    const finishedCount = CHAPTERS.filter((chapter) => isMainStoryChapter(chapter) && isFinished(chapter.number)).length;
    return Math.max(0, totalAvailable - finishedCount);
  }, [isFinished]);

  useSubtabShortcutNavigation({
    subtabShortcut,
    tabCount: SUBTABS.length,
    onNavigate: (nextIndexOrFn) => {
      const currentIndex = SUBTABS.indexOf(activeSubtab);
      const computed = typeof nextIndexOrFn === 'function' ? nextIndexOrFn(currentIndex) : nextIndexOrFn;
      const bounded = ((computed % SUBTABS.length) + SUBTABS.length) % SUBTABS.length;
      setActiveSubtab(SUBTABS[bounded]);
    },
  });

  const shared = {
    activeVol,
    setActiveVol,
    volume,
    volChapters,
    volColor,
    goPrev,
    goNext,
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
    nativePurchaseUrl,
    nativeVolumeLabel,
    enVolumeLabel,
    jpVolumeLabel,
    enShortLabel,
    jpShortLabel,
    uiLanguage,
    unreadCount,
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div
        style={{
          padding: isMobile ? '24px 10px 0 10px' : '28px 40px 0 40px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? '16px' : '0',
          position: 'relative',
          width: '100%'
        }}
      >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 24px',
                borderRadius: '24px',
                background: '#ffffff',
                border: '3.5px solid #3b82f6',
                borderBottom: '9.5px solid #3b82f6',
                boxShadow: '0 8px 18px rgba(59, 130, 246, 0.1)',
                zIndex: 1
            }}
        >
            <BookOpen size={isMobile ? 28 : 24} style={{ color: '#3b82f6' }} />
            <span style={{ 
                fontFamily: '"Sniglet", "Coming Soon", cursive', 
                color: '#3b82f6', 
                fontSize: isMobile ? '1.45rem' : '1.35rem', 
                fontWeight: '400',
                letterSpacing: '0.2px',
                lineHeight: 1
            }}>
                {chaptersTitle}
            </span>
        </motion.div>

        <div style={{ position: isMobile ? 'static' : 'absolute', right: isMobile ? 'auto' : '40px' }}>
          <ChaptersSubtabSelector
            isMobile={isMobile}
            activeSubtab={activeSubtab}
            setActiveSubtab={setActiveSubtab}
            t={t}
          />
        </div>
      </div>

      {/* Standalone Unread Badge */}
      {unreadCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: isMobile ? '30px 16px 0px 16px' : '42px 40px 0px 40px' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: isMobile ? '8px 18px' : '10px 24px',
              background: '#fef3c7',
              color: '#d97706',
              border: '3px solid #f59e0b',
              borderBottom: '8px solid #f59e0b',
              borderRadius: '20px',
              fontFamily: '"Sniglet", "Coming Soon", cursive',
              fontSize: isMobile ? '1.05rem' : '1.15rem',
              fontWeight: '400',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.15)',
            }}
          >
            <Pin size={isMobile ? 18 : 20} strokeWidth={3} />
            <span style={{ lineHeight: 1 }}>
              {unreadCount} {uiLanguage === 'ja' ? '未読' : (uiLanguage === 'es' || uiLanguage === 'pt' ? 'Sin leer' : (uiLanguage === 'fr' ? 'Non lu' : (uiLanguage === 'de' ? 'Ungelesen' : 'unread chapters!')))}
            </span>
          </motion.div>
        </div>
      )}

      {activeSubtab === 'main' ? (
        isMobile ? <MobileChapters {...shared} /> : <DesktopChapters {...shared} />
      ) : (
        <SideWorksTab
          isMobile={isMobile}
          sideWorks={SIDE_WORKS}
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
          ChapterRowComponent={ChapterRow}
        />
      )}
    </div>
  );
};

export default ChaptersPage;

