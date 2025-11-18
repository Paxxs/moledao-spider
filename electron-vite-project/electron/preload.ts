import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

import type {
  AppMetadata,
  JobTickerItem,
  LogEntry,
  ProgressPayload,
  RunSummary,
  ScrapeStatus,
} from '../src/types/ipc'
import type { AppSettings } from '../src/types/settings'

const subscribe = <T>(channel: string) => (callback: (payload: T) => void) => {
  const handler = (_event: IpcRendererEvent, payload: T) => callback(payload)
  ipcRenderer.on(channel, handler)
  return () => ipcRenderer.removeListener(channel, handler)
}

contextBridge.exposeInMainWorld('electronAPI', {
  startScrape: () => ipcRenderer.invoke('scrape:start'),
  cancelScrape: () => ipcRenderer.invoke('scrape:cancel'),
  selectDirectory: () => ipcRenderer.invoke('settings:select-directory') as Promise<string | null>,
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<AppSettings>,
  saveSettings: (settings: AppSettings) => ipcRenderer.invoke('settings:save', settings) as Promise<AppSettings>,
  getAppMeta: () => ipcRenderer.invoke('app:meta') as Promise<AppMetadata>,
  openExternalLink: (url: string) => ipcRenderer.invoke('app:open-external', url),
  openSummaryFolderAndExit: () => ipcRenderer.invoke('app:open-summary-and-exit'),
  onLog: subscribe<LogEntry>('scrape:log'),
  onStatus: subscribe<ScrapeStatus>('scrape:status'),
  onJobBatch: subscribe<JobTickerItem[]>('scrape:job-batch'),
  onProgress: subscribe<ProgressPayload>('scrape:progress'),
  onSummary: subscribe<RunSummary>('scrape:summary'),
})
