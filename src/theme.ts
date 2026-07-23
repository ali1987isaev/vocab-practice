import { useCallback, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'vocabulary-theme'
export const DEFAULT_THEME: ThemeMode = 'light'

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

export function loadTheme(): ThemeMode {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(savedTheme) ? savedTheme : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function applyTheme(theme: ThemeMode): void {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  themeColor?.setAttribute('content', theme === 'dark' ? '#101719' : '#eef1ef')
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // The selected theme still applies for this session when storage is unavailable.
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(loadTheme)

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme)
    applyTheme(nextTheme)
    saveTheme(nextTheme)
  }, [])

  useEffect(() => {
    const syncTheme = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !isThemeMode(event.newValue)) return
      setThemeState(event.newValue)
      applyTheme(event.newValue)
    }

    window.addEventListener('storage', syncTheme)
    return () => window.removeEventListener('storage', syncTheme)
  }, [])

  return { theme, setTheme }
}
