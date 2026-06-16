import { IS_PRODUCTION_SERVER } from '../../config/runtimeFlags';

export const ACTIVE_PAGE_STORAGE_KEY = 'skip_activePage';
export const READER_CHAPTER_STORAGE_KEY = 'skip_readerChapter';
export const ACCESSIBILITY_KEY = 'skip_accessibilityPrefs_v1';
export const READER_PREFS_KEY = 'skip_reader_prefs_v1';
export const LANGUAGE_KEY = 'skip_uiLanguage_v1';
export const SHORTCUT_STATS_KEY = 'skip_shortcutStats_v1';
export const DISCLAIMER_SEEN_KEY = 'skip_disclaimerSeen_v1';

export const isAnimeTabActive = () => {
  return false;
};

export const TAB_PAGES = [
  'home',
  'chapters',
  ...(isAnimeTabActive() ? ['anime'] : []),
  'gallery',
  'community',
  'blog',
  'quiz',
  'mystery',
  'birthdays',
  'settings',
];
export const DEFAULT_PAGE = TAB_PAGES[0];
export const JAPANESE_HIDDEN_TAB_PAGES = ['gallery', 'blog'];

export const getVisibleTabPages = (uiLanguage = 'en') => {
  const basePages = TAB_PAGES;

  if (uiLanguage === 'ja') {
    return basePages.filter((page) => !JAPANESE_HIDDEN_TAB_PAGES.includes(page));
  }

  return IS_PRODUCTION_SERVER ? basePages : TAB_PAGES;
};

export const VALID_COLOR_BLIND_MODES = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'black-white'];

export const DEFAULT_SHORTCUT_STATS = {
  usageCount: 0,
  coachSeen: false,
};

export const DEFAULT_ACCESSIBILITY_PREFS = {
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
  darkMode: false,
};
