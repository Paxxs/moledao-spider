import type { AppSettings, FieldKey } from '@/types/settings'

export type ScrapeStatus = 'idle' | 'running' | 'completed' | 'error'

export interface LogEntry {
  id: string
  message: string
  timestamp: number
  level: 'info' | 'error'
}

export interface JobTickerItem {
  id: string
  company: string
  title: string
  preference: string
}

export interface FieldPreferencePayload {
  order: FieldKey[]
  hidden: FieldKey[]
}

export interface ProgressPayload {
  processed: number
  total: number
}

export interface RunSummary {
  outputDirectory: string
  files: string[]
}

export interface AppMetadata {
  name: string
  author: string
  contact: string
  version: string
}

export interface ElectronAPI {
  startScrape: () => Promise<void>
  cancelScrape: () => Promise<void>
  selectDirectory: () => Promise<string | null>
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<AppSettings>
  getAppMeta: () => Promise<AppMetadata>
  onLog: (callback: (entry: LogEntry) => void) => () => void
  onStatus: (callback: (status: ScrapeStatus) => void) => () => void
  onJobBatch: (callback: (batch: JobTickerItem[]) => void) => () => void
  onProgress: (callback: (payload: ProgressPayload) => void) => () => void
  onSummary: (callback: (payload: RunSummary) => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
