import { useCallback, useEffect, useRef, useState } from 'react';

export const useCommunityEntries = ({
  getCachedEntries,
  fetchEntries,
  loadErrorMessage,
  staleTimeMs = 30_000,
}) => {
  const [entries, setEntries] = useState(() => getCachedEntries() || []);
  const [isLoading, setIsLoading] = useState(() => getCachedEntries() == null);
  const [errorMessage, setErrorMessage] = useState('');
  const lastVisibilityRefreshRef = useRef(0);

  const syncEntries = useCallback(async ({ force = false } = {}) => {
    const nextEntries = await fetchEntries({
      force,
      maxAgeMs: staleTimeMs,
    });
    setEntries(nextEntries);
    setErrorMessage('');
    return nextEntries;
  }, [fetchEntries, staleTimeMs]);

  useEffect(() => {
    let active = true;

    syncEntries()
      .catch((error) => {
        if (!active) return;
        setErrorMessage(error.message || loadErrorMessage);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadErrorMessage, syncEntries]);

  useEffect(() => {
    const handleRefresh = () => {
      if (document.visibilityState !== 'visible') return;

      const now = Date.now();
      if (now - lastVisibilityRefreshRef.current < 1200) return;
      lastVisibilityRefreshRef.current = now;

      void syncEntries().catch(() => {});
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [syncEntries]);

  return {
    entries,
    setEntries,
    isLoading,
    errorMessage,
    setErrorMessage,
    syncEntries,
  };
};
