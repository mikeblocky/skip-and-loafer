import { useState, useEffect } from 'react';
import { CHAPTERS, VOLUMES, VOL_COLORS } from '../data/chapters';
import MobileChaptersTab from './chapters/tabs/MobileChaptersTab';
import DesktopChaptersTab from './chapters/tabs/DesktopChaptersTab';
import {
  ChapterRow as SharedChapterRow,
  NavBtn as SharedNavBtn,
  VolSelector as SharedVolSelector,
} from './chapters/chaptersSharedComponents';
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

const ChaptersPage = ({ isMobile, uiLanguage = 'en', subtabShortcut, onReadChapter, isFinished, trackExternalLink, cancelExternalLink, markFinished, unmarkFinished, getReadCount, incrementReadCount, getRemainingCooldown, pendingLinks }) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const [countryCode, setCountryCode] = useState(null);

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

  useEffect(() => {
    const key = subtabShortcut?.key;
    if (!key) return;
    if (key === 'q') goPrev();
    if (key === 'e') goNext();
  }, [subtabShortcut?.token]);

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

  return isMobile ? <MobileChapters {...shared} /> : <DesktopChapters {...shared} />;
};

export default ChaptersPage;
