import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
  activePage,
  tabPages,
  setActivePage,
  setSubtabShortcut,
  toggleAccessibilityPanel,
  toggleShortcutPanel,
  setShortcutStats,
  closeAllPanels,
}) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      const targetTag = event.target?.tagName;
      const isTypingTarget = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT' || event.target?.isContentEditable;
      const key = event.key?.toLowerCase();

      if (event.key === 'Escape') {
        closeAllPanels();
        return;
      }

      if (isTypingTarget) return;

      let usedShortcut = false;

      const numericPageIndex = Number(event.key) - 1;
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

      if (event.altKey && key === 'a') {
        toggleAccessibilityPanel();
        usedShortcut = true;
      }

      if (event.altKey && key === 'k') {
        toggleShortcutPanel();
        usedShortcut = true;
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
    closeAllPanels,
    setActivePage,
    setShortcutStats,
    setSubtabShortcut,
    tabPages,
    toggleAccessibilityPanel,
    toggleShortcutPanel,
  ]);
};
