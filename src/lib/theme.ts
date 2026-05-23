export type ThemeMode = 'light' | 'dark'
export type ThemePreference = ThemeMode | 'system'

const STORAGE_KEY = 'theme'

export function getSystemTheme(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function readThemePreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return 'system'
}

export function writeThemePreference(preference: ThemeMode): void {
  localStorage.setItem(STORAGE_KEY, preference)
}

export function applyThemePreference(preference: ThemePreference): void {
  const html = document.documentElement
  html.classList.remove('light', 'dark')
  if (preference === 'light') {
    html.classList.add('light')
  } else if (preference === 'dark') {
    html.classList.add('dark')
  }
}

export function resolveTheme(preference: ThemePreference): ThemeMode {
  if (preference === 'light' || preference === 'dark') {
    return preference
  }
  return getSystemTheme()
}

export function initTheme(): ThemePreference {
  const preference = readThemePreference()
  applyThemePreference(preference)
  return preference
}
