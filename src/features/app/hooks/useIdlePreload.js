import { useEffect, useMemo } from 'react';

const warmedLoaders = new Set();

const normalizeOptions = (value) => {
  if (typeof value === 'number') {
    return { delayMs: value };
  }

  return value || {};
};

const isConstrainedDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const deviceMemory = Number(navigator.deviceMemory || 0);
  const hardwareConcurrency = Number(navigator.hardwareConcurrency || 0);
  return (deviceMemory > 0 && deviceMemory <= 4) || (hardwareConcurrency > 0 && hardwareConcurrency <= 4);
};

const isConstrainedConnection = () => {
  if (typeof navigator === 'undefined') return false;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return typeof connection.effectiveType === 'string' && /(^2g$|slow-2g)/.test(connection.effectiveType);
};

const useIdlePreload = (loaders, enabled = true, optionsInput = 120) => {
  const normalizedOptions = useMemo(() => normalizeOptions(optionsInput), [optionsInput]);
  const {
    delayMs = 120,
    staggerMs = 180,
    maxPreloadCount,
    respectConnection = true,
    respectDevice = true,
  } = normalizedOptions;

  useEffect(() => {
    if (!enabled || !Array.isArray(loaders) || !loaders.length || typeof window === 'undefined') {
      return undefined;
    }

    if ((respectConnection && isConstrainedConnection()) || (respectDevice && isConstrainedDevice())) {
      return undefined;
    }

    const pendingLoaders = loaders.filter((loader) => typeof loader === 'function' && !warmedLoaders.has(loader));
    if (!pendingLoaders.length) return undefined;

    const limit = Math.max(1, Math.min(
      pendingLoaders.length,
      maxPreloadCount ?? pendingLoaders.length,
    ));
    const queue = pendingLoaders.slice(0, limit);

    const timeoutIds = [];
    const idleIds = [];
    let cancelled = false;

    const schedule = (callback, waitMs) => {
      if (cancelled) return;
      if ('requestIdleCallback' in window) {
        const idleId = window.requestIdleCallback(callback, { timeout: Math.max(700, waitMs + 500) });
        idleIds.push(idleId);
        return;
      }

      const timeoutId = window.setTimeout(callback, waitMs);
      timeoutIds.push(timeoutId);
    };

    const runAtIndex = (index) => {
      if (cancelled || index >= queue.length) return;

      const loader = queue[index];
      warmedLoaders.add(loader);

      Promise.resolve(loader())
        .catch(() => {
          warmedLoaders.delete(loader);
        })
        .finally(() => {
          if (index + 1 < queue.length) {
            schedule(() => runAtIndex(index + 1), staggerMs);
          }
        });
    };

    schedule(() => runAtIndex(0), delayMs);

    return () => {
      cancelled = true;
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      if ('cancelIdleCallback' in window) {
        idleIds.forEach((idleId) => window.cancelIdleCallback(idleId));
      }
    };
  }, [delayMs, enabled, loaders, maxPreloadCount, respectConnection, respectDevice, staggerMs]);
};

export default useIdlePreload;
