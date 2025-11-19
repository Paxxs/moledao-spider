import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AboutScreen } from '@/components/about/AboutScreen'
import { MainScreen } from '@/components/main/MainScreen'
import { SettingsScreen } from '@/components/settings/SettingsScreen'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAppLocale } from '@/hooks/useAppLocale'
import { useScraperBridge } from '@/hooks/useScraperBridge'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { trackAppLaunch, trackOpenAbout, trackAboutLinkClick } from '@/lib/analytics'
import { appMeta } from '@/lib/meta'
import '@/lib/i18n'
import { useSettingsStore } from '@/store/settings'

function App() {
  const { t } = useTranslation()
  const [view, setView] = useState<'main' | 'settings' | 'about'>('main')
  const launchTrackedRef = useRef(false)
  const lastTrackedView = useRef<'main' | 'settings' | 'about' | null>(null)

  const hydrate = useSettingsStore((state) => state.hydrate)
  const loaded = useSettingsStore((state) => state.loaded)

  const { status, logs, tickerJobs, progress, summary, startScrape, cancelScrape, openSummaryFolderAndExit, openExternal } =
    useScraperBridge()

  useSystemTheme()
  useAppLocale()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (launchTrackedRef.current) return
    trackAppLaunch()
    launchTrackedRef.current = true
  }, [])

  useEffect(() => {
    if (view === 'about' && lastTrackedView.current !== 'about') {
      trackOpenAbout()
    }
    lastTrackedView.current = view
  }, [view])

  const handleOpenExternal = useCallback(async (url: string) => {
    try {
      const targetHost = new URL(url).hostname
      if (targetHost === 'i.nb.gl') {
        trackAboutLinkClick(targetHost)
      }
    } catch {
      if (url.includes('i.nb.gl')) {
        trackAboutLinkClick('i.nb.gl')
      }
    }
    await openExternal(url)
  }, [openExternal])

  return (
    <TooltipProvider>
      <div className="app-shell h-full bg-gradient-to-br from-background via-background to-background/70 text-foreground">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4 px-6 py-10">
          <header className="app-draggable select-none space-y-2 text-center md:text-left">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{appMeta.name}</h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{t('appTagline')}</p>
          </header>

          <main className="app-draggable flex flex-1 flex-col overflow-hidden">
            <div className="app-no-drag flex h-full flex-col gap-4">
              <Tabs value={view} onValueChange={(value) => setView(value as typeof view)} className="flex h-full flex-col gap-4">
                <TabsList className="grid w-full grid-cols-3 shadow-xl backdrop-blur-lg">
                  <TabsTrigger value="main">{t('viewMain')}</TabsTrigger>
                  <TabsTrigger value="settings">{t('settings')}</TabsTrigger>
                  <TabsTrigger value="about">{t('about')}</TabsTrigger>
                </TabsList>
                <div className="flex h-full flex-col overflow-hidden border-none p-0" >
                  <TabsContent value="main" className="h-full overflow-auto p-2 rounded-3xl">
                    <MainScreen
                      status={status}
                      logs={logs}
                      jobs={tickerJobs}
                      progress={progress}
                      summary={summary}
                      isHydrated={loaded}
                      onStart={startScrape}
                      onCancel={cancelScrape}
                      onOpenSummary={openSummaryFolderAndExit}
                      onNavigate={(destination) => setView(destination)}
                    />

                  </TabsContent>
                  <TabsContent value="settings" className="h-full overflow-auto">
                    <SettingsScreen />
                  </TabsContent>
                  <TabsContent value="about" className="h-full overflow-auto p-11">
                    <AboutScreen onOpenExternal={handleOpenExternal} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </main>

          <footer className="app-no-drag mt-2 rounded-2xl border border-white/20 bg-black/25 px-4 py-3 text-xs text-muted-foreground shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-2 text-center md:flex-row md:items-center md:justify-between md:text-left">
              <span>
                {t('authorLabel')}: {appMeta.author}
              </span>
              <span>
                {t('versionLabel')}: v{appMeta.version}
              </span>
            </div>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
