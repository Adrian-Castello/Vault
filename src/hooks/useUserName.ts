import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'vault:user-name'

function read(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function useUserName() {
  const [name, setNameState] = useState<string>(read)

  useEffect(() => {
    const sync = () => setNameState(read())
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) sync()
    }
    window.addEventListener('vault:user-name-changed', sync)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('vault:user-name-changed', sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const setName = useCallback((value: string) => {
    const trimmed = value.trim()
    try {
      if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed)
      else localStorage.removeItem(STORAGE_KEY)
      window.dispatchEvent(new CustomEvent('vault:user-name-changed'))
    } catch {
      // ignore
    }
    setNameState(trimmed)
  }, [])

  return { name, setName }
}
