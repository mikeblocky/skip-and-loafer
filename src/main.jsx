import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import './index.css'

const App = lazy(() => import('./App.jsx'))
const MitsumiBirthday = lazy(() => import('./MitsumiBirthday.jsx'))
const MakotoBirthday = lazy(() => import('./MakotoBirthday.jsx'))
const RetiredPage = lazy(() => import('./RetiredPage.jsx'))

const MITSUMI_FIRST_VISIT_KEY = 'skip_mitsumi_first_visit';

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const isMarchThird = () => {
  const now = new Date();
  return now.getMonth() === 2 && now.getDate() === 3;
};

/* ── Retirement date check ──
   After April 24, 2026 the entire site is replaced. */
const isRetired = () => {
  const now = new Date();
  const retireDate = new Date(2026, 3, 25); // Local April 25, 2026 (24th is last day)
  return now >= retireDate;
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
    <SpeedInsights />
    <Analytics />
  </StrictMode>,
)
