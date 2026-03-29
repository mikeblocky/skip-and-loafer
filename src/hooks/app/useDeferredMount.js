import { useEffect, useState } from 'react';

const useDeferredMount = (enabled, delayMs = 160) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setMounted(false);
      return undefined;
    }

    let timeoutId;
    let idleId;

    const commit = () => setMounted(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(commit, { timeout: delayMs + 120 });
    } else {
      timeoutId = window.setTimeout(commit, delayMs);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [delayMs, enabled]);

  return mounted;
};

export default useDeferredMount;
