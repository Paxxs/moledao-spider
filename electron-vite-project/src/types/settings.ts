import type { LocaleKey } from '@/i18n/resources'

export type FieldKey = 'location' | 'type' | 'preferences' | 'experience' | 'tag'
export type ThemePreference = 'system' | 'light' | 'dark'

export const FIELD_LABEL_MAP: Record<FieldKey, { i18nKey: string }> = {
  location: { i18nKey: 'field.location' },
  type: { i18nKey: 'field.type' },
  preferences: { i18nKey: 'field.preferences' },
  experience: { i18nKey: 'field.experience' },
  tag: { i18nKey: 'field.tag' },
}

export interface AppSettings {
  outputDirectory: string | null
  jobsPerDoc: number
  fieldOrder: FieldKey[]
  hiddenFields: FieldKey[]
  language: LocaleKey | 'system'
  theme: ThemePreference
}

export const defaultSettings: AppSettings = {
  outputDirectory: null,
  jobsPerDoc: 10,
  fieldOrder: ['location', 'preferences', 'type', 'experience', 'tag'],
  hiddenFields: [],
  language: 'system',
  theme: 'system',
}
