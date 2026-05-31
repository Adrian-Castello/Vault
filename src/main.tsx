import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { ToastProvider } from './hooks/useToast'
import './index.css'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

// Bloqueo de zoom pellizco / doble-tap (iOS Safari a veces ignora user-scalable=no
// en navegador normal; con esto queda fijado tanto en PWA como en web).
if (typeof window !== 'undefined') {
  // Pellizco (iOS)
  document.addEventListener('gesturestart', (e) => e.preventDefault())
  document.addEventListener('gesturechange', (e) => e.preventDefault())
  document.addEventListener('gestureend', (e) => e.preventDefault())

  // Doble-tap zoom
  let lastTouch = 0
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now()
      if (now - lastTouch <= 350) {
        e.preventDefault()
      }
      lastTouch = now
    },
    { passive: false },
  )

  // Ctrl + rueda (desktop) — opcional, ayuda en escritorio también
  document.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) e.preventDefault()
    },
    { passive: false },
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
