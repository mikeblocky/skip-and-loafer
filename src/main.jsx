import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const App = lazy(() => import('./App.jsx'))
const MitsumiBirthday = lazy(() => import('./MitsumiBirthday.jsx'))

const isMitsumiPage = window.location.pathname === '/mitsumi';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      {isMitsumiPage ? <MitsumiBirthday /> : <App />}
    </Suspense>
  </StrictMode>,
)
