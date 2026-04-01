import { useState, useEffect, useCallback, useRef } from 'react';

const SYNC_API_BASE = '/api/sync';
const POLL_INTERVAL = 15000;
const RESUME_SYNC_DEBOUNCE_MS = 1200;

/* ─── Sync data helpers ─── */
const collectSyncData = () => {
    const data = {};
    if (typeof localStorage === 'undefined') return data;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('skip_')) data[key] = localStorage.getItem(key);
    }
    return data;
};

const serializeSyncSnapshot = (data) => JSON.stringify(
    Object.entries(data || {}).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
);

/**
 * Merge remote sync data with local data.
 * - skip_finished: union of local and remote arrays
 * - skip_readCount: max of local and remote per chapter
 * - skip_syncKey: keep local (never overwrite from remote)
 * - All other skip_* keys: remote wins (last-write-wins)
 */
const mergeSyncData = (remoteData) => {
    if (typeof localStorage === 'undefined') return;

    // --- Merge skip_finished (union) ---
    const localFinishedRaw = localStorage.getItem('skip_finished');
    const remoteFinishedRaw = remoteData['skip_finished'];
    let mergedFinished;
    try {
        const localSet = new Set(localFinishedRaw ? JSON.parse(localFinishedRaw) : []);
        const remoteSet = new Set(remoteFinishedRaw ? JSON.parse(remoteFinishedRaw) : []);
        remoteSet.forEach(ch => localSet.add(ch));
        mergedFinished = JSON.stringify([...localSet]);
    } catch {
        mergedFinished = remoteFinishedRaw || localFinishedRaw || '[]';
    }

    // --- Merge skip_readCount (max per chapter) ---
    const localCountsRaw = localStorage.getItem('skip_readCount');
    const remoteCountsRaw = remoteData['skip_readCount'];
    let mergedCounts;
    try {
        const localCounts = localCountsRaw ? JSON.parse(localCountsRaw) : {};
        const remoteCounts = remoteCountsRaw ? JSON.parse(remoteCountsRaw) : {};
        const allKeys = new Set([...Object.keys(localCounts), ...Object.keys(remoteCounts)]);
        const merged = {};
        for (const ch of allKeys) {
            merged[ch] = Math.max(localCounts[ch] || 0, remoteCounts[ch] || 0);
        }
        mergedCounts = JSON.stringify(merged);
    } catch {
        mergedCounts = remoteCountsRaw || localCountsRaw || '{}';
    }

    // --- Apply: selectively update keys without wiping unrelated ones ---
    // Preserve skip_syncKey, skip_linkClicks, skip_activePage, skip_readerChapter
    const preserveKeys = ['skip_syncKey', 'skip_linkClicks', 'skip_activePage', 'skip_readerChapter'];

    // Write remote data for all non-progress, non-preserved keys  
    Object.entries(remoteData).forEach(([key, value]) => {
        if (key === 'skip_finished' || key === 'skip_readCount') return;
        if (preserveKeys.includes(key)) return;
        localStorage.setItem(key, value);
    });

    // Write merged progress keys
    localStorage.setItem('skip_finished', mergedFinished);
    localStorage.setItem('skip_readCount', mergedCounts);
};

/**
 * Clear all read progress data from localStorage.
 */
const clearProgressData = () => {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem('skip_finished');
    localStorage.removeItem('skip_readCount');
    localStorage.removeItem('skip_linkClicks');
};

export const useSyncData = (reloadFromStorage) => {
    const [syncKey, setSyncKey] = useState(() => {
        if (typeof localStorage === 'undefined') return '';
        return localStorage.getItem('skip_syncKey') || '';
    });
    const [syncActive, setSyncActive] = useState(() => {
        if (typeof localStorage === 'undefined') return false;
        return !!localStorage.getItem('skip_syncKey');
    });
    const [lastSynced, setLastSynced] = useState(null);
    const pollRef = useRef(null);
    const pushPendingRef = useRef(false);
    const lastPushedKeyRef = useRef('');
    const lastPushedHashRef = useRef('');
    const lastResumeSyncAtRef = useRef(0);

    // Refs to avoid stale closures in callbacks/timers
    const syncKeyRef = useRef(syncKey);
    const syncActiveRef = useRef(syncActive);
    useEffect(() => { syncKeyRef.current = syncKey; }, [syncKey]);
    useEffect(() => { syncActiveRef.current = syncActive; }, [syncActive]);

    // Persist key
    useEffect(() => {
        if (syncKey) localStorage.setItem('skip_syncKey', syncKey);
        else localStorage.removeItem('skip_syncKey');
    }, [syncKey]);

    const pushData = useCallback(async (key, options = {}) => {
        if (!key) return;
        const {
            force = false,
            dataOverride = null,
        } = options;
        try {
            const data = dataOverride || collectSyncData();
            const nextHash = serializeSyncSnapshot(data);

            if (!force && key === lastPushedKeyRef.current && nextHash === lastPushedHashRef.current) {
                return false;
            }

            await fetch(`${SYNC_API_BASE}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data, key })
            });
            lastPushedKeyRef.current = key;
            lastPushedHashRef.current = nextHash;
            setLastSynced(new Date());
            return true;
        } catch { /* silent */ }
        return false;
    }, []);

    const pullData = useCallback(async (key) => {
        if (!key) return false;
        try {
            const res = await fetch(`${SYNC_API_BASE}/claim?key=${encodeURIComponent(key)}&peek=true`);
            if (!res.ok) return false;
            const { data } = await res.json();
            if (data) {
                mergeSyncData(data);
                reloadFromStorage?.();
                window.dispatchEvent(new CustomEvent('skip_sync_complete', { detail: { timestamp: new Date() } }));
                setLastSynced(new Date());
                return true;
            }
        } catch { /* silent */ }
        return false;
    }, [reloadFromStorage]);

    /**
     * Full sync cycle: pull (merge remote into local), then push merged result.
     * This ensures both devices converge to the union of their data.
     */
    const syncCycle = useCallback(async (key) => {
        if (!key) return;
        const pulled = await pullData(key);
        const nextData = collectSyncData();
        const nextHash = serializeSyncSnapshot(nextData);
        const localChanged = key !== lastPushedKeyRef.current || nextHash !== lastPushedHashRef.current;

        if (pulled || localChanged) {
            await pushData(key, {
                force: pulled,
                dataOverride: nextData,
            });
        }
    }, [pullData, pushData]);

    /**
     * Immediately push local data to server.
     * Uses refs to avoid stale closure issues on mobile.
     */
    const pushNow = useCallback(() => {
        const key = syncKeyRef.current;
        const active = syncActiveRef.current;
        if (!active || !key) return;
        if (pushPendingRef.current) return;
        pushPendingRef.current = true;
        // Wait for React effects to flush state → localStorage
        setTimeout(async () => {
            pushPendingRef.current = false;
            await pushData(key);
        }, 200);
    }, [pushData]);

    /**
     * Disconnect: clear key, stop polling, wipe progress data.
     */
    const disconnect = useCallback(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        setSyncKey('');
        setSyncActive(false);
        setLastSynced(null);
        lastPushedKeyRef.current = '';
        lastPushedHashRef.current = '';
        clearProgressData();
        reloadFromStorage?.();
    }, [reloadFromStorage]);

    // Polling logic: pull → push every interval (pull first so we merge before overwriting!)
    // Also sync on visibility change (critical for mobile where setInterval is suspended)
    useEffect(() => {
        if (!syncActive || !syncKey) {
            if (pollRef.current) clearInterval(pollRef.current);
            return;
        }

        // Initial sync on mount/enable
        syncCycle(syncKey);

        pollRef.current = setInterval(() => {
            syncCycle(syncKey);
        }, POLL_INTERVAL);

        // On mobile, setInterval stops when tab is backgrounded.
        // Re-sync immediately when user returns.
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                const key = syncKeyRef.current;
                const now = Date.now();
                if (now - lastResumeSyncAtRef.current < RESUME_SYNC_DEBOUNCE_MS) return;
                lastResumeSyncAtRef.current = now;
                if (key) syncCycle(key);
            }
        };
        const handleFocus = () => {
            const key = syncKeyRef.current;
            const now = Date.now();
            if (now - lastResumeSyncAtRef.current < RESUME_SYNC_DEBOUNCE_MS) return;
            lastResumeSyncAtRef.current = now;
            if (key) syncCycle(key);
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('focus', handleFocus);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('focus', handleFocus);
        };
    }, [syncActive, syncKey, syncCycle]);

    return {
        syncKey,
        setSyncKey,
        syncActive,
        setSyncActive,
        lastSynced,
        pushData,
        pullData,
        pushNow,
        disconnect,
    };
};
