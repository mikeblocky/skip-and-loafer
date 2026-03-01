import { useEffect } from 'react';

export const useGalleryPrefetch = ({ activePage, loadGalleryPage }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;
    let timeoutId;
    let idleId;

    const prefetch = () => {
      if (cancelled || activePage === 'gallery') return;
      loadGalleryPage().catch(() => {});
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(prefetch, { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(prefetch, 900);
    }

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [activePage, loadGalleryPage]);
};
