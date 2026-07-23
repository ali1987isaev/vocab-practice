import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles.css'
import { applyTheme, loadTheme } from './theme'

const UPDATE_INTERVAL = 60 * 60 * 1000
const FOREGROUND_CHECK_THROTTLE = 60 * 1000
const LEGACY_CACHE_NAME = 'vocab-practice-v1'
let updateInterval: number | undefined
let registrationTimer: number | undefined
let lastForegroundCheck = 0

applyTheme(loadTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

let updateSW: (reloadPage?: boolean) => Promise<void> = async () => {}

const registerServiceWorker = (): void => {
  if ('caches' in window) {
    void window.caches.delete(LEGACY_CACHE_NAME)
  }

  updateSW = registerSW({
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
}

const scheduleServiceWorkerRegistration = (): void => {
  registrationTimer = window.setTimeout(registerServiceWorker, 1000)
}

if (document.readyState === 'complete') {
  scheduleServiceWorkerRegistration()
} else {
  window.addEventListener('load', scheduleServiceWorkerRegistration, { once: true })
}

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
    window.removeEventListener('load', scheduleServiceWorkerRegistration)
    document.removeEventListener('visibilitychange', checkForUpdate)
    window.removeEventListener('focus', checkForUpdate)
    if (registrationTimer !== undefined) window.clearTimeout(registrationTimer)
    if (updateInterval !== undefined) window.clearInterval(updateInterval)
  })
}
