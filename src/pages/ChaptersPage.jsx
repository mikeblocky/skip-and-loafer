import { startTransition, useEffect, useMemo, useState } from 'react';
import { CHAPTERS, SIDE_WORKS, VOLUMES, VOL_COLORS, isMainChapter } from '../data/chapters';
import MobileChaptersTab from '../features/chapters/tabs/MobileChaptersTab';
import DesktopChaptersTab from '../features/chapters/tabs/DesktopChaptersTab';
import SideWorksTab from '../features/chapters/tabs/SideWorksTab';
import ChaptersPageHeader from '../features/chapters/ChaptersPageHeader';
import usePageTitle from '../hooks/shared/usePageTitle';
import APP_UI_TEXT_GLOBAL from '../config/appUiText';
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

const ChaptersPage = ({
  isMobile,
  uiLanguage = 'en',
  subtabShortcut,
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
}) => {
  const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
  const tGlobal = APP_UI_TEXT_GLOBAL[uiLanguage] || APP_UI_TEXT_GLOBAL.en;
  const chaptersTitle = t.chapters || 'Chapters';

  usePageTitle(tGlobal.tabs?.chapters?.label || 'Chapters');

  const [countryCode, setCountryCode] = useState(null);
  const [activeSubtab, _setActiveSubtab] = useState(() => {
    const saved = localStorage.getItem('skip_chaptersSubtab');
    return saved === 'side' ? 'side' : 'main';
  });

  const setActiveSubtab = (valueOrFn) => {
    startTransition(() => {
      _setActiveSubtab((previous) => {
        const next = typeof valueOrFn === 'function' ? valueOrFn(previous) : valueOrFn;
        localStorage.setItem('skip_chaptersSubtab', next);
        return next;
      });
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

  const setActiveVol = (valueOrFn) => {
    startTransition(() => {
      _setActiveVol((previous) => {
        const next = typeof valueOrFn === 'function' ? valueOrFn(previous) : valueOrFn;
        localStorage.setItem('skip_activeVol', String(next));
        return next;
      });
    });
  };

  const volume = VOLUMES[activeVol];
  const volChapters = volume.chapters.map((number) => CHAPTERS.find((chapter) => chapter.number === number)).filter(Boolean);
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

  const goPrev = () => setActiveVol((previous) => Math.max(0, previous - 1));
  const goNext = () => setActiveVol((previous) => Math.min(VOLUMES.length - 1, previous + 1));

  const unreadCount = useMemo(() => {
    const totalAvailable = CHAPTERS.filter((chapter) => isMainChapter(chapter.number) && (chapter.links?.en || chapter.pages)).length;
    const finishedCount = CHAPTERS.filter((chapter) => isMainChapter(chapter.number) && isFinished(chapter.number)).length;
    return Math.max(0, totalAvailable - finishedCount);
  }, [isFinished]);

  const unreadLabel = (t.unreadShort || '{count} unread chapter{suffix}!')
    .replace('{count}', unreadCount)
    .replace('{suffix}', getCountryPluralSuffix(uiLanguage, unreadCount));

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
          width: '100%',
        }}
      >
        <ChaptersPageHeader
          isMobile={isMobile}
          title={chaptersTitle}
          activeSubtab={activeSubtab}
          setActiveSubtab={setActiveSubtab}
          t={t}
          unreadCount={unreadCount}
          unreadLabel={unreadLabel}
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
