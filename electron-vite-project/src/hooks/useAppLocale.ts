import { useEffect } from 'react'

import i18n, { detectSystemLocale } from '@/lib/i18n'
import { useSettingsStore } from '@/store/settings'

export const useAppLocale = () => {
  const language = useSettingsStore((state) => state.settings.language)

  useEffect(() => {
    const target = language === 'system' ? detectSystemLocale() : language
    if (target && i18n.language !== target) {
      i18n.changeLanguage(target)
    }
  }, [language])
}
