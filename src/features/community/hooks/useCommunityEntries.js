import { useCallback, useEffect, useRef, useState } from 'react';

export const useCommunityEntries = ({
  getCachedEntries,
  fetchEntries,
  loadErrorMessage,
  offlineEventTypes = [],
  staleTimeMs = 30_000,
}) => {
  const [entries, setEntries] = useState(() => getCachedEntries() || []);
  const [isLoading, setIsLoading] = useState(() => getCachedEntries() == null);
  const [errorMessage, setErrorMessage] = useState('');
  const lastVisibilityRefreshRef = useRef(0);
  const offlineEventTypesKey = offlineEventTypes.join('|');

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

    const refreshFromCache = () => {
      setEntries(getCachedEntries() || []);
    };

    const handleSyncComplete = (event) => {
      if (!offlineEventTypesKey.split('|').includes(event.detail?.type)) return;
      void syncEntries({ force: true }).catch(refreshFromCache);
    };

    const handleOfflineQueueChange = (event) => {
      if (!offlineEventTypesKey.split('|').includes(event.detail?.type)) return;
      refreshFromCache();
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);
    window.addEventListener('skip_offline_sync_complete', handleSyncComplete);
    window.addEventListener('skip_offline_queue_change', handleOfflineQueueChange);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
      window.removeEventListener('skip_offline_sync_complete', handleSyncComplete);
      window.removeEventListener('skip_offline_queue_change', handleOfflineQueueChange);
    };
  }, [getCachedEntries, offlineEventTypesKey, syncEntries]);

  return {
    entries,
    setEntries,
    isLoading,
    errorMessage,
    setErrorMessage,
    syncEntries,
  };
};
