import { useEffect, useState } from 'react';

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    let rafId = null;

    const handleResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const width = window.innerWidth;
        const height = window.innerHeight;
        setWindowSize((prev) => {
          if (prev.width === width && prev.height === height) return prev;
          return { width, height };
        });
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return windowSize;
};
