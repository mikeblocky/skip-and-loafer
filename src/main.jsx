import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MitsumiBirthday from './MitsumiBirthday.jsx'

const isMitsumiPage = window.location.pathname === '/mitsumi';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isMitsumiPage ? <MitsumiBirthday /> : <App />}
  </StrictMode>,
)
