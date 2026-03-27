import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CHAPTERS, SIDE_WORKS, VOLUMES, VOL_COLORS } from '../data/chapters';
import { JELLY_TAP, JELLY_HOVER, SQUASH_TRANSITION } from './shared/animationPresets';
import { triggerHaptic } from '../utils/haptics';
import MobileChaptersTab from './chapters/tabs/MobileChaptersTab';
import DesktopChaptersTab from './chapters/tabs/DesktopChaptersTab';
import SideWorksTab from './chapters/tabs/SideWorksTab';
import {
  ChapterRow as SharedChapterRow,
  NavBtn as SharedNavBtn,
  VolSelector as SharedVolSelector,
} from './chapters/chaptersSharedComponents';
import { useSubtabShortcutNavigation } from '../hooks/useSubtabShortcutNavigation';
import { buildNativeLink, isNativePreOrderVolume } from './chapters/chapterStoreLinks';
import { NOTE_PALETTES, getReadTier } from './chapters/chapterTierConfig';
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
} from './chapters/chapterLanguageContent';

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

const ChaptersSubtabSelector = ({ isMobile, activeSubtab, setActiveSubtab, t }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      borderRadius: '9999px',
      padding: '4px',
      border: '1.5px solid #e5e7eb',
      background: '#f9fafb',
    }}
  >
    {[
      { id: 'main', label: t.mainStory || 'Main story' },
      { id: 'side', label: t.sideWorks || 'Side works' },
    ].map((tab) => {
      const isActive = activeSubtab === tab.id;
      return (
        <motion.button
          key={tab.id}
          onClick={() => { triggerHaptic('tap'); setActiveSubtab(tab.id); }}
          whileHover={{ ...JELLY_HOVER, transition: { type: 'spring', stiffness: 400, damping: 12 } }}
          whileTap={{ ...JELLY_TAP, transition: SQUASH_TRANSITION }}
          style={{
            border: 'none',
            borderRadius: '9999px',
            padding: isMobile ? '8px 12px' : '7px 14px',
            cursor: 'pointer',
            background: isActive ? '#0ea5e9' : '#f3f4f6',
            color: isActive ? '#ffffff' : '#6b7280',
            fontFamily: 'var(--font-hand)',
            fontWeight: 'bold',
            fontSize: isMobile ? '0.86rem' : '0.88rem',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {tab.label}
        </motion.button>
      );
    })}
  </div>
);

const ChaptersPage = ({ isMobile, uiLanguage = 'en', subtabShortcut, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, markFinished, unmarkFinished, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
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
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div
        style={{
          padding: isMobile ? '12px 10px 0 10px' : '14px 40px 0 40px',
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}
      >
        <ChaptersSubtabSelector
          isMobile={isMobile}
          activeSubtab={activeSubtab}
          setActiveSubtab={setActiveSubtab}
          t={t}
        />
      </div>

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
