import { useCallback, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

function readInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function resolve(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark') return mode
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyToDOM(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(readInitialMode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => resolve(readInitialMode()))

  // Aplicar al DOM y guardar
  useEffect(() => {
    const t = resolve(mode)
    setTheme(t)
    applyToDOM(t)
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  // En modo "system", escuchar cambios del SO
  useEffect(() => {
    if (mode !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const t = resolve('system')
      setTheme(t)
      applyToDOM(t)
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [mode])

  const setMode = useCallback((m: ThemeMode) => setModeState(m), [])

  // Mantengo `toggle` por compatibilidad con el código existente.
  const toggle = useCallback(() => {
    setModeState((m) => {
      const current = resolve(m)
      return current === 'dark' ? 'light' : 'dark'
    })
  }, [])

  return { mode, setMode, theme, toggle }
}
