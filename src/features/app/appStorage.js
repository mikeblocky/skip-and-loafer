import { getInitialUiLanguage } from '../../config/uiLanguage';
import {
  ACCESSIBILITY_KEY,
  ACTIVE_PAGE_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFS,
  DEFAULT_PAGE,
  DEFAULT_SHORTCUT_STATS,
  DISCLAIMER_SEEN_KEY,
  LANGUAGE_KEY,
  READER_CHAPTER_STORAGE_KEY,
  SHORTCUT_STATS_KEY,
  TAB_PAGES,
  VALID_COLOR_BLIND_MODES,
} from './appConstants';

const getStorage = () => {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const safeGetItem = (key) => {
  const storage = getStorage();
  if (!storage) return null;

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key, value) => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
};

const parseStoredJson = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getInitialDisclaimerVisibility = () => safeGetItem(DISCLAIMER_SEEN_KEY) !== '1';

export const persistDisclaimerSeen = () => {
  safeSetItem(DISCLAIMER_SEEN_KEY, '1');
};

export const getInitialActivePage = (allowedPages = TAB_PAGES) => {
  const fallback = safeGetItem(ACTIVE_PAGE_STORAGE_KEY) || DEFAULT_PAGE;

  if (typeof window === 'undefined') {
    return allowedPages.includes(fallback) ? fallback : allowedPages[0] || DEFAULT_PAGE;
  }

  const hashPage = window.location.hash.replace('#', '');
  if (allowedPages.includes(hashPage)) return hashPage;
  return allowedPages.includes(fallback) ? fallback : allowedPages[0] || DEFAULT_PAGE;
};

export const getInitialReaderChapter = () => parseStoredJson(safeGetItem(READER_CHAPTER_STORAGE_KEY));

export const getInitialUiLanguageValue = () => getInitialUiLanguage(LANGUAGE_KEY);

export const getInitialShortcutStats = () => {
  const parsed = parseStoredJson(safeGetItem(SHORTCUT_STATS_KEY));

  if (!parsed) {
    return { ...DEFAULT_SHORTCUT_STATS };
  }

  return {
    usageCount: Number(parsed.usageCount) || 0,
    coachSeen: !!parsed.coachSeen,
  };
};

export const getInitialAccessibilityPrefs = () => {
  const parsed = parseStoredJson(safeGetItem(ACCESSIBILITY_KEY));

  if (!parsed) {
    return { ...DEFAULT_ACCESSIBILITY_PREFS };
  }

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
    colorBlindMode: VALID_COLOR_BLIND_MODES.includes(parsed.colorBlindMode) ? parsed.colorBlindMode : 'none',
  };
};

export const getInitialReaderPrefs = () => {
  const parsed = parseStoredJson(safeGetItem('skip_reader_prefs_v1'));

  if (!parsed) {
    return {
      largeText: false,
      wideSpacing: false,
      focusWidth: false,
      theme: 'paper',
    };
  }

  return {
    largeText: !!parsed.largeText,
    wideSpacing: !!parsed.wideSpacing,
    focusWidth: !!parsed.focusWidth,
    theme: ['paper', 'sepia', 'night'].includes(parsed.theme) ? parsed.theme : 'paper',
  };
};
