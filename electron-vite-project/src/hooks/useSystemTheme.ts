import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

const getPreferred = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export const useSystemTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(getPreferred)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => setTheme(media.matches ? 'light' : 'dark')
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
  }, [theme])

  return theme
}
