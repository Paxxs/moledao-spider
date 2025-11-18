import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import pkg from '../package.json'
import { ScraperService } from './services/scraper'
import { readSettings, writeSettings } from './services/settingsStore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let scraper: ScraperService

function createWindow() {
  win = new BrowserWindow({
    width: 1300,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#05060a',
    title: pkg.productName ?? 'Moledao Scraper',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.removeMenu?.()

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  scraper = new ScraperService(() => win)
  registerIpcHandlers()
})

const registerIpcHandlers = () => {
  ipcMain.handle('settings:get', () => readSettings())
  ipcMain.handle('settings:save', (_event, payload) => writeSettings(payload))
  ipcMain.handle('settings:select-directory', async () => {
    const targetWindow = win ?? BrowserWindow.getFocusedWindow()
    const options: Electron.OpenDialogOptions = {
      properties: ['openDirectory', 'createDirectory'],
    }
    const result = targetWindow
      ? await dialog.showOpenDialog(targetWindow, options)
      : await dialog.showOpenDialog(options)
    if (result.canceled || !result.filePaths.length) {
      return null
    }
    return result.filePaths[0]
  })

  ipcMain.handle('scrape:start', async () => {
    await scraper?.start(readSettings())
  })

  ipcMain.handle('scrape:cancel', () => {
    scraper?.cancel()
  })

  ipcMain.handle('app:open-external', (_event, url: string) => {
    if (url) {
      return shell.openExternal(url)
    }
  })

  ipcMain.handle('app:open-summary-and-exit', async () => {
    const summary = scraper?.getLastSummary()
    if (summary) {
      await shell.openPath(summary.outputDirectory)
    }
    app.quit()
  })

  ipcMain.handle('app:meta', () => ({
    name: pkg.productName ?? pkg.name,
    author:
      pkg.appAuthor ?? (typeof pkg.author === 'string' ? pkg.author : pkg.author?.name) ?? 'Unknown',
    contact: pkg.appContact ?? pkg.homepage ?? '',
    version: pkg.version ?? '0.0.0',
  }))
}
