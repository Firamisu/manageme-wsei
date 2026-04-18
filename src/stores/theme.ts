import { ref, computed, onScopeDispose } from 'vue'
import { defineStore } from 'pinia'
import {
  applyThemePreference,
  getSystemTheme,
  initTheme,
  readThemePreference,
  writeThemePreference,
  type ThemeMode,
  type ThemePreference,
} from '../lib/theme'

export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>(initTheme())
  const systemTheme = ref<ThemeMode>(getSystemTheme())

  const resolvedTheme = computed<ThemeMode>(() => {
    if (preference.value === 'light' || preference.value === 'dark') {
      return preference.value
    }
    return systemTheme.value
  })

  const isDark = computed(() => resolvedTheme.value === 'dark')

  let mediaQuery: MediaQueryList | null = null

  function onSystemThemeChange(): void {
    systemTheme.value = getSystemTheme()
  }

  function startSystemListener(): void {
    if (typeof window === 'undefined') {
      return
    }
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', onSystemThemeChange)
  }

  function stopSystemListener(): void {
    mediaQuery?.removeEventListener('change', onSystemThemeChange)
    mediaQuery = null
  }

  function setPreference(next: ThemePreference): void {
    preference.value = next
    applyThemePreference(next)
    if (next === 'light' || next === 'dark') {
      writeThemePreference(next)
    }
  }

  function toggleTheme(): void {
    const next: ThemeMode = resolvedTheme.value === 'dark' ? 'light' : 'dark'
    setPreference(next)
  }

  startSystemListener()
  onScopeDispose(stopSystemListener)

  return {
    preference,
    resolvedTheme,
    isDark,
    toggleTheme,
    setPreference,
    readThemePreference,
  }
})
