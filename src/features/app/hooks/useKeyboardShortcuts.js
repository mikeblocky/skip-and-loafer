import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
  activePage,
  tabPages,
  setActivePage,
  setSubtabShortcut,
  setShortcutStats,
}) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      const targetTag = event.target?.tagName;
      const isTypingTarget = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT' || event.target?.isContentEditable;
      const key = event.key?.toLowerCase();

      if (isTypingTarget) return;

      let usedShortcut = false;

      const tabShortcutKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
      const numericPageIndex = tabShortcutKeys.indexOf(event.key);

      if (Number.isInteger(numericPageIndex) && numericPageIndex >= 0 && numericPageIndex < tabPages.length) {
        setActivePage(tabPages[numericPageIndex]);
        usedShortcut = true;
      }

      if (!event.altKey && !usedShortcut) {
        const subtabKeys = ['q', 'e'];
        if (subtabKeys.includes(key) && ['chapters', 'gallery', 'sync'].includes(activePage)) {
          setSubtabShortcut((prev) => ({ key, token: prev.token + 1 }));
          usedShortcut = true;
        }
      }

      if (usedShortcut) {
        event.preventDefault();
        setShortcutStats((prev) => ({ ...prev, usageCount: prev.usageCount + 1 }));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activePage,
    setActivePage,
    setShortcutStats,
    setSubtabShortcut,
    tabPages,
  ]);
};
