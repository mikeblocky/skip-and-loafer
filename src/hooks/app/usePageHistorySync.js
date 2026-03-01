import { useEffect, useRef } from 'react';

export const usePageHistorySync = ({ activePage, setActivePage, tabPages }) => {
  const isPopNavigatingRef = useRef(false);
  const historyReadyRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onPopState = (event) => {
      const statePage = event.state?.skipApp ? event.state.page : null;
      const hashPage = window.location.hash.replace('#', '');
      const nextPage = tabPages.includes(statePage)
        ? statePage
        : (tabPages.includes(hashPage) ? hashPage : null);

      if (!nextPage || nextPage === activePage) return;
      isPopNavigatingRef.current = true;
      setActivePage(nextPage);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activePage, setActivePage, tabPages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = `#${activePage}`;
    const state = { skipApp: true, page: activePage };

    if (!historyReadyRef.current) {
      window.history.replaceState(state, '', hash);
      historyReadyRef.current = true;
      return;
    }

    if (isPopNavigatingRef.current) {
      isPopNavigatingRef.current = false;
      if (window.location.hash !== hash) {
        window.history.replaceState(state, '', hash);
      }
      return;
    }

    const current = window.history.state;
    const alreadyCurrent = current?.skipApp && current.page === activePage && window.location.hash === hash;
    if (!alreadyCurrent) {
      window.history.pushState(state, '', hash);
    }
  }, [activePage]);
};
