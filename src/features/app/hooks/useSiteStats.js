import { useEffect, useRef, useState } from 'react';

export const SITE_STATS_KEY = 'skip_site_stats_v1';

const SAVE_INTERVAL_MS = 10000;
const MAX_SESSION_DELTA_MS = 60000;
const DEVICE_ID_KEY = 'site_stats_device_id_v1';

const createEmptyStats = () => ({
  version: 1,
  totalTimeMs: 0,
  visits: 0,
  pageViews: 0,
  pageSwitches: 0,
  pages: {},
  devices: {},
  firstSeenAt: null,
  lastSeenAt: null,
  currentStreakDays: 0,
  longestStreakDays: 0,
  lastVisitDay: null,
});

const getDeviceId = () => {
  try {
    const stored = localStorage.getItem(DEVICE_ID_KEY);
    if (stored) return stored;
    const next = `device_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  } catch {
    return 'device_local';
  }
};

const aggregateStats = (stats) => {
  const devices = stats.devices && Object.keys(stats.devices).length > 0 ? stats.devices : null;
  if (!devices) return stats;

  const totals = Object.values(devices).reduce((next, device) => {
    next.totalTimeMs += device.totalTimeMs || 0;
    next.visits += device.visits || 0;
    next.pageViews += device.pageViews || 0;
    next.pageSwitches += device.pageSwitches || 0;
    Object.entries(device.pages || {}).forEach(([pageKey, page]) => {
      next.pages[pageKey] = {
        views: (next.pages[pageKey]?.views || 0) + (page.views || 0),
        timeMs: (next.pages[pageKey]?.timeMs || 0) + (page.timeMs || 0),
        lastSeenAt: page.lastSeenAt || next.pages[pageKey]?.lastSeenAt || null,
      };
    });
    next.longestStreakDays = Math.max(next.longestStreakDays, device.longestStreakDays || 0);
    next.currentStreakDays = Math.max(next.currentStreakDays, device.currentStreakDays || 0);
    return next;
  }, {
    totalTimeMs: 0,
    visits: 0,
    pageViews: 0,
    pageSwitches: 0,
    pages: {},
    currentStreakDays: 0,
    longestStreakDays: 0,
  });

  return { ...stats, ...totals, devices };
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const safeParseStats = (raw) => {
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    return aggregateStats({
      ...createEmptyStats(),
      ...parsed,
      pages: parsed && typeof parsed.pages === 'object' && parsed.pages ? parsed.pages : {},
      devices: parsed && typeof parsed.devices === 'object' && parsed.devices ? parsed.devices : {},
    });
  } catch {
    return createEmptyStats();
  }
};

export const readSiteStats = () => {
  if (typeof localStorage === 'undefined') return createEmptyStats();
  return safeParseStats(localStorage.getItem(SITE_STATS_KEY));
};

const updateCurrentDevice = (stats, updater) => {
  const deviceId = getDeviceId();
  const currentDevice = {
    totalTimeMs: 0,
    visits: 0,
    pageViews: 0,
    pageSwitches: 0,
    pages: {},
    currentStreakDays: 0,
    longestStreakDays: 0,
    ...(stats.devices?.[deviceId] || {}),
  };
  const nextDevice = updater(currentDevice);
  return aggregateStats({
    ...stats,
    devices: {
      ...(stats.devices || {}),
      [deviceId]: nextDevice,
    },
  });
};

const writeSiteStats = (stats) => {
  try {
    localStorage.setItem(SITE_STATS_KEY, JSON.stringify(stats));
  } catch {
    // Browser storage can be unavailable in private browsing.
  }
};

const addVisitStreak = (stats, todayKey) => {
  if (stats.lastVisitDay === todayKey) return stats;

  const previousDay = stats.lastVisitDay ? new Date(`${stats.lastVisitDay}T00:00:00Z`) : null;
  const today = new Date(`${todayKey}T00:00:00Z`);
  const dayGap = previousDay ? Math.round((today - previousDay) / 86400000) : null;
  const currentStreakDays = dayGap === 1 ? (stats.currentStreakDays || 1) + 1 : 1;

  return {
    ...stats,
    currentStreakDays,
    longestStreakDays: Math.max(stats.longestStreakDays || 0, currentStreakDays),
    lastVisitDay: todayKey,
  };
};

export const useSiteStats = ({ activePage, syncActive, pushNow }) => {
  const [siteStats, setSiteStats] = useState(readSiteStats);
  const activePageRef = useRef(activePage || 'home');
  const lastTickAtRef = useRef(Date.now());
  const lastSaveAtRef = useRef(Date.now());
  const previousPageRef = useRef(activePage || 'home');

  useEffect(() => {
    const nowIso = new Date().toISOString();
    const todayKey = getTodayKey();
    const storedStats = readSiteStats();
    const nextStats = updateCurrentDevice(addVisitStreak({
      ...storedStats,
      firstSeenAt: storedStats.firstSeenAt || nowIso,
      lastSeenAt: nowIso,
    }, todayKey), (device) => addVisitStreak({
      ...device,
      visits: (device.visits || 0) + 1,
      firstSeenAt: device.firstSeenAt || nowIso,
      lastSeenAt: nowIso,
    }, todayKey));

    writeSiteStats(nextStats);
    setSiteStats(nextStats);
  }, []);

  useEffect(() => {
    if (!activePage) return;

    const nowIso = new Date().toISOString();
    const previousPage = previousPageRef.current;
    const changedPage = previousPage && previousPage !== activePage;
    previousPageRef.current = activePage;
    activePageRef.current = activePage;

    setSiteStats((current) => {
      const next = updateCurrentDevice({
        ...current,
        lastSeenAt: nowIso,
      }, (device) => ({
        ...device,
        pageViews: (device.pageViews || 0) + 1,
        pageSwitches: (device.pageSwitches || 0) + (changedPage ? 1 : 0),
        lastSeenAt: nowIso,
        pages: {
          ...device.pages,
          [activePage]: {
            ...(device.pages?.[activePage] || {}),
            views: (device.pages?.[activePage]?.views || 0) + 1,
            timeMs: device.pages?.[activePage]?.timeMs || 0,
            lastSeenAt: nowIso,
          },
        },
      }));
      writeSiteStats(next);
      return next;
    });
  }, [activePage]);

  useEffect(() => {
    const tick = ({ force = false } = {}) => {
      const now = Date.now();
      const rawDelta = now - lastTickAtRef.current;
      lastTickAtRef.current = now;

      if (document.visibilityState !== 'visible') return;
      const delta = Math.max(0, Math.min(rawDelta, MAX_SESSION_DELTA_MS));
      if (!force && delta < 250) return;

      setSiteStats((current) => {
        const page = activePageRef.current || 'home';
        const next = updateCurrentDevice({
          ...current,
          lastSeenAt: new Date().toISOString(),
        }, (device) => ({
          ...device,
          totalTimeMs: (device.totalTimeMs || 0) + delta,
          lastSeenAt: new Date().toISOString(),
          pages: {
            ...device.pages,
            [page]: {
              ...(device.pages?.[page] || {}),
              views: device.pages?.[page]?.views || 0,
              timeMs: (device.pages?.[page]?.timeMs || 0) + delta,
              lastSeenAt: new Date().toISOString(),
            },
          },
        }));

        if (force || now - lastSaveAtRef.current >= SAVE_INTERVAL_MS) {
          lastSaveAtRef.current = now;
          writeSiteStats(next);
          if (syncActive) pushNow?.();
        }

        return next;
      });
    };

    const intervalId = window.setInterval(tick, 1000);
    const handleBeforeUnload = () => tick({ force: true });
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') tick({ force: true });
      else lastTickAtRef.current = Date.now();
    };
    const handleSyncComplete = () => setSiteStats(readSiteStats());

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('skip_sync_complete', handleSyncComplete);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      tick({ force: true });
      window.clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('skip_sync_complete', handleSyncComplete);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pushNow, syncActive]);

  return siteStats;
};
