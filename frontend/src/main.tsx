import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

// Order matters: the design system first, then this site's own chrome.
import './styles/broadsheet.css'
import './styles/site.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
