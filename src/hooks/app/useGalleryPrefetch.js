import { useEffect } from 'react';

export const useGalleryPrefetch = ({ activePage, loadGalleryPage }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.innerWidth <= 768) return undefined;

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection?.saveData) return undefined;
    if (typeof connection?.effectiveType === 'string' && /(^2g$|slow-2g)/.test(connection.effectiveType)) return undefined;

    let cancelled = false;
    let timeoutId;
    let idleId;

    const prefetch = () => {
      if (cancelled || activePage === 'gallery') return;
      loadGalleryPage().catch(() => {});
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(prefetch, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(prefetch, 2200);
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
