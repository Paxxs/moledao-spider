import { create } from 'zustand'

import { detectSystemLocale } from '@/lib/i18n'
import type { ElectronAPI } from '@/types/ipc'
import { type AppSettings, defaultSettings } from '@/types/settings'

interface SettingsStore {
  settings: AppSettings
  loaded: boolean
  loading: boolean
  updateSettings: (updater: (prev: AppSettings) => AppSettings) => void
  hydrate: () => Promise<void>
  persist: () => Promise<void>
}

const fallbackSettings: AppSettings = {
  ...defaultSettings,
  language: detectSystemLocale(),
}

const getAPI = (): ElectronAPI | undefined => window.electronAPI

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: fallbackSettings,
  loaded: false,
  loading: false,
  updateSettings: (updater) => set((state) => ({ settings: updater(state.settings) })),
  hydrate: async () => {
    if (get().loaded || get().loading) return
    const api = getAPI()
    if (!api) {
      set({ loaded: true })
      return
    }
    set({ loading: true })
    try {
      const payload = await api.getSettings()
      set({ settings: { ...fallbackSettings, ...payload }, loaded: true })
    } finally {
      set({ loading: false })
    }
  },
  persist: async () => {
    const api = getAPI()
    if (!api) return
    const updated = await api.saveSettings(get().settings)
    set({ settings: updated })
  },
}))
