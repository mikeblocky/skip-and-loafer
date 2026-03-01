import { useEffect } from 'react';

export const useSubtabShortcutNavigation = ({ subtabShortcut, tabCount, onNavigate }) => {
  useEffect(() => {
    const key = subtabShortcut?.key;
    if (!key) return;
    if (typeof onNavigate !== 'function') return;
    if (!Number.isFinite(tabCount) || tabCount <= 0) return;

    if (key === 'q') {
      onNavigate((prev) => (prev - 1 + tabCount) % tabCount);
    }
    if (key === 'e') {
      onNavigate((prev) => (prev + 1) % tabCount);
    }
  }, [subtabShortcut?.token, tabCount, onNavigate]);
};
