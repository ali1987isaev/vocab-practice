import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles.css'

const UPDATE_INTERVAL = 60 * 60 * 1000
const FOREGROUND_CHECK_THROTTLE = 60 * 1000
const LEGACY_CACHE_NAME = 'vocab-practice-v1'
let updateInterval: number | undefined
let lastForegroundCheck = 0

if ('caches' in window) {
  void window.caches.delete(LEGACY_CACHE_NAME)
}

const updateSW: (reloadPage?: boolean) => Promise<void> = registerSW({
  immediate: true,

  onNeedRefresh() {
    void updateSW(true)
  },

  onRegisteredSW(_serviceWorkerUrl, registration) {
    if (!registration) return

    updateInterval = window.setInterval(() => {
      void registration.update()
    }, UPDATE_INTERVAL)
  },

  onRegisterError(error) {
    console.error('Service worker registration failed:', error)
  },
})

const checkForUpdate = (): void => {
  if (document.visibilityState !== 'visible' || !('serviceWorker' in navigator)) return

  const now = Date.now()
  if (now - lastForegroundCheck < FOREGROUND_CHECK_THROTTLE) return
  lastForegroundCheck = now

  void navigator.serviceWorker.ready.then((registration) => {
    void registration.update()
  })
}

document.addEventListener('visibilitychange', checkForUpdate)
window.addEventListener('focus', checkForUpdate)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    document.removeEventListener('visibilitychange', checkForUpdate)
    window.removeEventListener('focus', checkForUpdate)
    if (updateInterval !== undefined) window.clearInterval(updateInterval)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
