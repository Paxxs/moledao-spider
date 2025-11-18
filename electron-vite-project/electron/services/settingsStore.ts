import Store from 'electron-store'
import { app } from 'electron'

import { type AppSettings, defaultSettings } from '@/types/settings'

let store: Store<AppSettings> | null = null

const getStore = () => {
  if (!store) {
    store = new Store<AppSettings>({
      name: 'settings',
      cwd: app.getPath('userData'),
      defaults: defaultSettings,
      clearInvalidConfig: true,
    })
  }
  return store
}

export const readSettings = (): AppSettings => ({ ...defaultSettings, ...getStore().store })

export const writeSettings = (settings: AppSettings): AppSettings => {
  const sanitized: AppSettings = {
    ...defaultSettings,
    ...settings,
    jobsPerDoc: Math.min(20, Math.max(1, Math.floor(settings.jobsPerDoc ?? defaultSettings.jobsPerDoc))),
  }
  getStore().store = sanitized
  return sanitized
}
