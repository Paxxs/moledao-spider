import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { resources, type LocaleKey } from '@/i18n/resources'

export const supportedLocales: { code: LocaleKey; label: string }[] = [
  { code: 'zh-CN', label: resources['zh-CN'].translation.simplifiedChinese },
  { code: 'zh-TW', label: resources['zh-TW'].translation.traditionalChinese },
  { code: 'en', label: resources.en.translation.english },
]

export const detectSystemLocale = (): LocaleKey => {
  const lang = navigator?.language?.toLowerCase?.() ?? 'en'
  if (lang.startsWith('zh-tw') || lang.startsWith('zh-hant')) {
    return 'zh-TW'
  }
  if (lang.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en'
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: detectSystemLocale(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator'],
    },
  })
}

export default i18n
