import { useEffect, useState } from 'react'

import { useSettingsStore } from '@/store/settings'

type ThemeMode = 'light' | 'dark'

const getPreferred = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export const useSystemTheme = () => {
  const preference = useSettingsStore((state) => state.settings.theme)
  const [systemTheme, setSystemTheme] = useState<ThemeMode>(getPreferred)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => setSystemTheme(media.matches ? 'light' : 'dark')
    handler()
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const activeTheme: ThemeMode = preference === 'system' ? systemTheme : preference

  useEffect(() => {
    const root = document.documentElement
    if (activeTheme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
  }, [activeTheme])

  return activeTheme
}
