import { useState, useCallback, useEffect, useRef } from 'react';
import { enqueueReadIncrement } from '../../../utils/offlineSync';

const STORAGE_KEY = 'skip_finished';
const READ_COUNT_KEY = 'skip_readCount';
const LINK_CLICK_KEY = 'skip_linkClicks'; // temp storage for pending external link reads
const READ_TIME_MS = 4 * 60 * 1000; // 4 minutes

/**
 * Reads the set of finished chapter numbers from localStorage.
 */
const getFinished = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
};

/**
 * Saves the finished set back to localStorage.
 */
const saveFinished = (set) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
};

/**
 * Reads the read count map from localStorage.
 */
const getReadCounts = () => {
    try {
        const raw = localStorage.getItem(READ_COUNT_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

/**
 * Saves the read count map back to localStorage.
 */
const saveReadCounts = (counts) => {
    localStorage.setItem(READ_COUNT_KEY, JSON.stringify(counts));
};

const getPendingLinks = () => {
    try {
        const raw = localStorage.getItem(LINK_CLICK_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

/**
 * Hook that manages reading progress and reread counts.
 */
export const useReadProgress = () => {
    const [finished, setFinished] = useState(() => getFinished());
    const [readCounts, setReadCounts] = useState(() => getReadCounts());
    const [pendingLinks, setPendingLinks] = useState(() => getPendingLinks());

    // Keep track of local marking timestamps to prevent rapid-fire counting
    // from rapid scrolling or repeatedly entering/exiting the reader session.
    const lastMarkedRef = useRef({});

    // Sync state → localStorage
    useEffect(() => { saveFinished(finished); }, [finished]);
    useEffect(() => { saveReadCounts(readCounts); }, [readCounts]);

    const markFinished = useCallback((chapterNumber) => {
        const now = Date.now();
        const lastMarked = lastMarkedRef.current[chapterNumber] || 0;

        // Prevent counting the exact same chapter again within 1 minute
        if (now - lastMarked < 60000) {
            console.log(`Debounced read progress for chapter ${chapterNumber}`);
            return;
        }
        lastMarkedRef.current[chapterNumber] = now;

        setFinished(prev => {
            const next = new Set(prev);
            if (!prev.has(chapterNumber)) {
                // Not previously finished? We can just track it.
            }
            next.add(chapterNumber);
            return next;
        });

        // Always increment local read count
        setReadCounts(prev => ({
            ...prev,
            [chapterNumber]: (prev[chapterNumber] || 0) + 1
        }));

        // Increment global read count
        if (navigator.onLine) {
            fetch('/api/reads/increment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chapter: chapterNumber })
            }).catch(err => {
                console.error('Global increment failed, queuing offline', err);
                enqueueReadIncrement(chapterNumber);
            });
        } else {
            console.log('Offline: Queued chapter read increment');
            enqueueReadIncrement(chapterNumber);
        }
    }, []);

    const incrementReadCount = useCallback((chapterNumber) => {
        const now = Date.now();
        const lastMarked = lastMarkedRef.current[chapterNumber] || 0;

        if (now - lastMarked < 60000) return;
        lastMarkedRef.current[chapterNumber] = now;

        // Also mark as finished (first-time reads need this)
        setFinished(prev => {
            const next = new Set(prev);
            next.add(chapterNumber);
            return next;
        });

        setReadCounts(prev => ({
            ...prev,
            [chapterNumber]: (prev[chapterNumber] || 0) + 1
        }));

        if (navigator.onLine) {
            fetch('/api/reads/increment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chapter: chapterNumber })
            }).catch(err => {
                console.error('Global increment failed, queuing offline', err);
                enqueueReadIncrement(chapterNumber);
            });
        } else {
            console.log('Offline: Queued chapter read increment');
            enqueueReadIncrement(chapterNumber);
        }
    }, []);

    const unmarkFinished = useCallback((chapterNumber) => {
        setFinished(prev => {
            if (!prev.has(chapterNumber)) return prev;
            const next = new Set(prev);
            next.delete(chapterNumber);
            return next;
        });
    }, []);

    const getRemainingCooldown = useCallback((chapterNumber) => {
        const now = Date.now();
        const lastMarked = lastMarkedRef.current[chapterNumber] || 0;
        const diff = now - lastMarked;
        return diff < 60000 ? Math.ceil((60000 - diff) / 1000) : 0;
    }, []);

    const isFinished = useCallback((chapterNumber) => finished.has(chapterNumber), [finished]);

    const getReadCount = useCallback((chapterNumber) => readCounts[chapterNumber] || 0, [readCounts]);

    /**
     * Track an external link click.
     */
    const trackExternalLink = useCallback((chapterNumber) => {
        try {
            const clicks = JSON.parse(localStorage.getItem(LINK_CLICK_KEY) || '{}');
            clicks[chapterNumber] = Date.now();
            localStorage.setItem(LINK_CLICK_KEY, JSON.stringify(clicks));
            setPendingLinks(clicks);
        } catch { /* ignore */ }
    }, []);

    const cancelExternalLink = useCallback((chapterNumber) => {
        try {
            const clicks = JSON.parse(localStorage.getItem(LINK_CLICK_KEY) || '{}');
            if (clicks[chapterNumber]) {
                delete clicks[chapterNumber];
                if (Object.keys(clicks).length === 0) {
                    localStorage.removeItem(LINK_CLICK_KEY);
                } else {
                    localStorage.setItem(LINK_CLICK_KEY, JSON.stringify(clicks));
                }
                setPendingLinks(clicks);
            }
        } catch { /* ignore */ }
    }, []);

    // Check pending link reads on focus/visibility
    useEffect(() => {
        const checkPending = () => {
            try {
                const raw = localStorage.getItem(LINK_CLICK_KEY);
                if (!raw) return;
                const clicks = JSON.parse(raw);
                const now = Date.now();
                let changed = false;

                for (const [ch, timestamp] of Object.entries(clicks)) {
                    if (now - timestamp >= READ_TIME_MS) {
                        const chNum = parseFloat(ch);
                        setFinished(prev => {
                            const next = new Set(prev);
                            next.add(chNum);
                            return next;
                        });
                        setReadCounts(prev => ({
                            ...prev,
                            [chNum]: (prev[chNum] || 0) + 1
                        }));

                        // Increment global read count
                        if (navigator.onLine) {
                            fetch('/api/reads/increment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ chapter: chNum })
                            }).catch(err => {
                                console.error('Global increment failed, queuing offline', err);
                                enqueueReadIncrement(chNum);
                            });
                        } else {
                            console.log('Offline: Queued chapter read increment');
                            enqueueReadIncrement(chNum);
                        }

                        delete clicks[ch];
                        changed = true;
                    }
                }

                if (changed) {
                    if (Object.keys(clicks).length === 0) {
                        localStorage.removeItem(LINK_CLICK_KEY);
                    } else {
                        localStorage.setItem(LINK_CLICK_KEY, JSON.stringify(clicks));
                    }
                    setPendingLinks(clicks);
                }
            } catch { /* ignore */ }
        };

        checkPending();

        const onFocus = () => checkPending();
        const onVisibility = () => { if (document.visibilityState === 'visible') checkPending(); };
        const onUnload = () => {
            // Cancel any pending countdowns if left before it finishes
            localStorage.removeItem(LINK_CLICK_KEY);
        };

        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('beforeunload', onUnload);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('beforeunload', onUnload);
        };
    }, []);

    // Reload from localStorage (e.g. after sync import)
    const reloadFromStorage = useCallback(() => {
        setFinished(getFinished());
        setReadCounts(getReadCounts());
        setPendingLinks(getPendingLinks());
    }, []);

    return {
        finished,
        finishedCount: finished.size,
        readCounts,
        pendingLinks,
        markFinished,
        unmarkFinished,
        isFinished,
        getReadCount,
        incrementReadCount,
        trackExternalLink,
        cancelExternalLink,
        reloadFromStorage,
        getRemainingCooldown,
    };
};
