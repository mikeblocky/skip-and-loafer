import { useState, useEffect, useCallback } from 'react';

export const useQuickPanels = ({ quickControlsRef, shortcutStats, setShortcutStats }) => {
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [showShortcutPanel, setShowShortcutPanel] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const closeAllPanels = useCallback(() => {
    setShowAccessibilityPanel(false);
    setShowShortcutPanel(false);
    setShowLanguageMenu(false);
  }, []);

  useEffect(() => {
    if (!(showAccessibilityPanel || showShortcutPanel || showLanguageMenu)) return;

    const onPointerDown = (event) => {
      if (!quickControlsRef.current) return;
      if (!quickControlsRef.current.contains(event.target)) {
        closeAllPanels();
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [showAccessibilityPanel, showShortcutPanel, showLanguageMenu, quickControlsRef, closeAllPanels]);

  const toggleAccessibilityPanel = useCallback(() => {
    setShowAccessibilityPanel((prev) => {
      const next = !prev;
      if (next) {
        setShowShortcutPanel(false);
        setShowLanguageMenu(false);
      }
      return next;
    });
  }, []);

  const toggleShortcutPanel = useCallback(() => {
    setShowShortcutPanel((prev) => {
      const next = !prev;
      if (next) {
        setShowAccessibilityPanel(false);
        setShowLanguageMenu(false);
      }
      return next;
    });
  }, []);

  const toggleLanguagePanel = useCallback(() => {
    setShowLanguageMenu((prev) => {
      const next = !prev;
      if (next) {
        setShowAccessibilityPanel(false);
        setShowShortcutPanel(false);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (shortcutStats.coachSeen || shortcutStats.usageCount < 6) return;
    setShowAccessibilityPanel(false);
    setShowLanguageMenu(false);
    setShowShortcutPanel(true);
    setShortcutStats((prev) => ({ ...prev, coachSeen: true }));
  }, [shortcutStats, setShortcutStats]);

  return {
    showAccessibilityPanel,
    showShortcutPanel,
    showLanguageMenu,
    setShowLanguageMenu,
    toggleAccessibilityPanel,
    toggleShortcutPanel,
    toggleLanguagePanel,
    closeAllPanels,
  };
};
