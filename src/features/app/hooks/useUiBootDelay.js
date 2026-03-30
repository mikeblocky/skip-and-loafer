import { useState, useEffect } from 'react';

export const useUiBootDelay = () => {
  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setShowUI(true);
      return undefined;
    }

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setShowUI(true));
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return showUI;
};
