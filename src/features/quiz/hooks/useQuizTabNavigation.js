import { useState } from 'react';
import { useSubtabShortcutNavigation } from '../../../hooks/shared/useSubtabShortcutNavigation';

export const useQuizTabNavigation = ({ subtabShortcut, tabsLength }) => {
  const [activeTab, setActiveTab] = useState(0);

  useSubtabShortcutNavigation({
    subtabShortcut,
    tabCount: tabsLength,
    onNavigate: setActiveTab,
  });

  return { activeTab, setActiveTab };
};
