import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { OFFLINE_PUBLIC_ASSETS } from './data/offlineAssets.js'

const App = lazy(() => import('./App.jsx'))
const MitsumiBirthday = lazy(() => import('./MitsumiBirthday.jsx'))
const MakotoBirthday = lazy(() => import('./MakotoBirthday.jsx'))
const RetiredPage = lazy(() => import('./RetiredPage.jsx'))

const MITSUMI_FIRST_VISIT_KEY = 'skip_mitsumi_first_visit';
const INSTALL_PROMPT_READY_EVENT = 'skip_install_prompt_ready';
const OFFLINE_LIBRARY_ENABLED_KEY = 'skip_offline_library_enabled_v1';

window.__skipInstallPromptEvent = null;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  window.__skipInstallPromptEvent = event;
  window.dispatchEvent(new CustomEvent(INSTALL_PROMPT_READY_EVENT));
});

window.addEventListener('appinstalled', () => {
  window.__skipInstallPromptEvent = null;
});

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

        if (!registration.active) {
          registration.addEventListener('updatefound', () => {
            registration.installing?.addEventListener('statechange', () => {
              if (registration.active) sendOfflineAssetListIfEnabled();
            });
          });
        }

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
