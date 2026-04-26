import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'

// Apply saved language direction on load
const savedLang = localStorage.getItem('lang') || 'en'
document.documentElement.dir = savedLang === 'he' ? 'rtl' : 'ltr'
document.documentElement.lang = savedLang

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
