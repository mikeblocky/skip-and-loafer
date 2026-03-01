import { useEffect, useState, useCallback } from 'react';

export const useMainScrollTop = ({ mainScrollRef, showUI }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;

    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setShowScrollTop(el.scrollTop > 300);
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener('scroll', onScroll);
    };
  }, [mainScrollRef, showUI]);

  const scrollToTop = useCallback(() => {
    const el = mainScrollRef.current;
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({ top: 0, behavior: 'smooth' });
      window.setTimeout(() => {
        if ((el.scrollTop || 0) > 1) {
          el.scrollTop = 0;
        }
      }, 320);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 320);
  }, [mainScrollRef]);

  return { showScrollTop, scrollToTop };
};
