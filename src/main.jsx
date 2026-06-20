import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { OFFLINE_PUBLIC_ASSETS } from './data/offlineAssets.js'
import { flushPendingRequests } from './utils/offlineSync.js'
import { getChapterReleaseDate, getReleasedChapterNotification } from './data/chapterReleaseInfo.js'
import {
  INSTALL_PROMPT_READY_EVENT,
  OFFLINE_LIBRARY_ENABLED_KEY,
  PWA_UPDATE_APPLY_EVENT,
  PWA_UPDATE_READY_EVENT,
} from './utils/pwaEvents.js'
import {
  getDevicePerformanceSnapshot,
  readPerformanceModePreference,
  resolvePerformanceMode,
} from './utils/performanceMode.js'

const App = lazy(() => import('./App.jsx'))
const MitsumiBirthday = lazy(() => import('./MitsumiBirthday.jsx'))
const MakotoBirthday = lazy(() => import('./MakotoBirthday.jsx'))
const RetiredPage = lazy(() => import('./RetiredPage.jsx'))

const MITSUMI_FIRST_VISIT_KEY = 'skip_mitsumi_first_visit';

const applyInitialPerformanceMode = () => {
  const preference = readPerformanceModePreference();
  const resolved = resolvePerformanceMode(preference, getDevicePerformanceSnapshot());
  document.documentElement.dataset.appPerformance = resolved;
  document.documentElement.dataset.appPerformancePref = preference;
};

applyInitialPerformanceMode();

const CHAPTER_RELEASE_NOTIFICATION_ACK_KEY = 'skip_chapter_release_notification_ack_v1';

const maybeNotifyReleasedChapter = async () => {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  if (Date.now() < getChapterReleaseDate().getTime()) return;

  const notification = getReleasedChapterNotification();
  try {
    if (localStorage.getItem(CHAPTER_RELEASE_NOTIFICATION_ACK_KEY) === notification.tag) return;
  } catch {
    // Private browsing can block storage; the notification can still be attempted.
  }

  try {
    const registration = await navigator.serviceWorker?.ready?.catch(() => null);
    if (registration?.showNotification) {
      await registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/swt2-512.png',
        badge: '/swt2-512.png',
        tag: notification.tag,
        renotify: false,
        data: { url: '/#chapters' },
      });
    } else {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/swt2-512.png',
        tag: notification.tag,
      });
    }
    try {
      localStorage.setItem(CHAPTER_RELEASE_NOTIFICATION_ACK_KEY, notification.tag);
    } catch {}
  } catch {
    // Permission can exist while the platform still blocks display.
  }
};

window.__skipInstallPromptEvent = null;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  window.__skipInstallPromptEvent = event;
  window.dispatchEvent(new CustomEvent(INSTALL_PROMPT_READY_EVENT));
});

window.addEventListener('appinstalled', () => {
  window.__skipInstallPromptEvent = null;
});

const installLightweightImageDefaults = () => {
  if (typeof document === 'undefined' || !('MutationObserver' in window)) return;

  const prepareImage = (img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (!img.hasAttribute('loading')) img.loading = 'lazy';
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
    if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'auto');
  };

  document.querySelectorAll('img').forEach(prepareImage);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLImageElement) {
          prepareImage(node);
          return;
        }
        node.querySelectorAll?.('img')?.forEach(prepareImage);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
};

installLightweightImageDefaults();

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const isMarchThird = () => {
  const now = new Date();
  return now.getMonth() === 2 && now.getDate() === 3;
};

/* ── Retirement date check ──
   After May 25, 2026 the entire site is replaced. */
const isRetired = () => {
  return false;
};

// If the site is retired, skip all other routing
const siteIsRetired = isRetired();

let isMitsumiPage = window.location.pathname === '/mitsumi';
const isMakotoPage = window.location.hash.toLowerCase() === '#makoto';

if (!siteIsRetired && !isMitsumiPage && !isMakotoPage && isMarchThird()) {
  const todayKey = getTodayKey();
  let hasVisitedToday = false;

  try {
    hasVisitedToday = localStorage.getItem(MITSUMI_FIRST_VISIT_KEY) === todayKey;
  } catch {
    hasVisitedToday = false;
  }

  if (!hasVisitedToday) {
    try {
      localStorage.setItem(MITSUMI_FIRST_VISIT_KEY, todayKey);
    } catch {
      // ignore storage failures
    }

    window.location.replace('/mitsumi');
    isMitsumiPage = true;
  }
}

const getRootComponent = () => {
  if (siteIsRetired) return <RetiredPage />;
  if (isMitsumiPage) return <MitsumiBirthday />;
  if (isMakotoPage) return <MakotoBirthday />;
  return <App />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      {getRootComponent()}
    </Suspense>
  </StrictMode>,
)

// Register PWA service worker for offline capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const announceUpdateReady = (registration) => {
      window.__skipWaitingServiceWorker = registration.waiting || null;
      window.dispatchEvent(new CustomEvent(PWA_UPDATE_READY_EVENT));
    };

    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        const sendOfflineAssetList = () => {
          const worker = registration.active || registration.waiting || registration.installing || navigator.serviceWorker.controller;
          if (!worker) return;
          worker.postMessage({
            type: 'SKIP_CACHE_OFFLINE_ASSETS',
            assets: OFFLINE_PUBLIC_ASSETS,
          });
        };
        const sendOfflineAssetListIfEnabled = () => {
          try {
            if (localStorage.getItem(OFFLINE_LIBRARY_ENABLED_KEY) === '1') {
              sendOfflineAssetList();
            }
          } catch {
            // Storage can be unavailable in private browsing; manual Settings action still works.
          }
        };

        if (registration.waiting) {
          announceUpdateReady(registration);
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          installingWorker?.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              announceUpdateReady(registration);
              return;
            }
            if (registration.active) sendOfflineAssetListIfEnabled();
          });
        });

        window.addEventListener(PWA_UPDATE_APPLY_EVENT, () => {
          const waitingWorker = registration.waiting || window.__skipWaitingServiceWorker;
          waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
        });

        navigator.serviceWorker.ready.then(sendOfflineAssetListIfEnabled).catch(() => {});
        navigator.serviceWorker.addEventListener('controllerchange', sendOfflineAssetListIfEnabled);
        window.addEventListener('online', sendOfflineAssetListIfEnabled);
        window.addEventListener('focus', sendOfflineAssetListIfEnabled);
        window.addEventListener('pageshow', sendOfflineAssetListIfEnabled);
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) sendOfflineAssetListIfEnabled();
        });
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.error('[Service Worker] Registration failed:', err);
        }
      });
  });
}

window.addEventListener('online', flushPendingRequests);
window.addEventListener('focus', flushPendingRequests);
window.addEventListener('focus', maybeNotifyReleasedChapter);
window.addEventListener('pageshow', maybeNotifyReleasedChapter);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) maybeNotifyReleasedChapter();
});
maybeNotifyReleasedChapter();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) flushPendingRequests();
});
flushPendingRequests();
