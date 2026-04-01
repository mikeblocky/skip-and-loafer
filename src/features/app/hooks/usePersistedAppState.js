import { useEffect } from 'react';
import { ACTIVE_PAGE_STORAGE_KEY, READER_CHAPTER_STORAGE_KEY } from '../appConstants';

export const usePersistedAppState = ({
  activePage,
  readerChapter,
  accessibilityPrefs,
  uiLanguage,
  shortcutStats,
  accessibilityKey,
  languageKey,
  shortcutStatsKey,
}) => {
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, activePage);
    } catch {
      // ignore storage failures
    }
  }, [activePage]);

  useEffect(() => {
    try {
      if (readerChapter) {
        localStorage.setItem(READER_CHAPTER_STORAGE_KEY, JSON.stringify({
          number: readerChapter.number,
        }));
        return;
      }

      localStorage.removeItem(READER_CHAPTER_STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  }, [readerChapter]);

  useEffect(() => {
    try {
      localStorage.setItem(accessibilityKey, JSON.stringify(accessibilityPrefs));
    } catch {
      // ignore storage failures
    }
  }, [accessibilityKey, accessibilityPrefs]);

  useEffect(() => {
    try {
      localStorage.setItem(languageKey, uiLanguage);
    } catch {
      // ignore storage failures
    }
  }, [languageKey, uiLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem(shortcutStatsKey, JSON.stringify(shortcutStats));
    } catch {
      // ignore storage failures
    }
  }, [shortcutStatsKey, shortcutStats]);

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
    root.setAttribute('data-a11y-dim-non-essential-colors', accessibilityPrefs.dimNonEssentialColors ? '1' : '0');
    root.setAttribute('data-a11y-colorblind-mode', accessibilityPrefs.colorBlindMode || 'none');
    root.setAttribute('lang', uiLanguage);
  }, [accessibilityPrefs, uiLanguage]);
};
