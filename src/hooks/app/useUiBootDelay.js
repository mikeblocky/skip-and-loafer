import { useState, useEffect } from 'react';

export const useUiBootDelay = ({ coverCount }) => {
  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowUI(true), coverCount * 70 + 500);
    return () => clearTimeout(timer);
  }, [coverCount]);

  return showUI;
};
