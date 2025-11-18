import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AboutScreen } from '@/components/about/AboutScreen'
import { MainScreen } from '@/components/main/MainScreen'
import { SettingsScreen } from '@/components/settings/SettingsScreen'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAppLocale } from '@/hooks/useAppLocale'
import { useScraperBridge } from '@/hooks/useScraperBridge'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { appMeta } from '@/lib/meta'
import '@/lib/i18n'
import { useSettingsStore } from '@/store/settings'

function App() {
  const { t } = useTranslation()
  const [view, setView] = useState<'main' | 'settings' | 'about'>('main')

  const hydrate = useSettingsStore((state) => state.hydrate)
  const loaded = useSettingsStore((state) => state.loaded)

  const { status, logs, tickerJobs, progress, summary, startScrape, cancelScrape, openSummaryFolderAndExit, openExternal } =
    useScraperBridge()

  useSystemTheme()
  useAppLocale()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/70 text-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <header className="space-y-2 text-center md:text-left">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">{appMeta.author}</p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{appMeta.name}</h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{t('appTagline')}</p>
          </header>

          <Tabs value={view} onValueChange={(value) => setView(value as typeof view)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 text-white shadow-xl backdrop-blur-lg">
              <TabsTrigger value="main">{t('viewMain')}</TabsTrigger>
              <TabsTrigger value="settings">{t('settings')}</TabsTrigger>
              <TabsTrigger value="about">{t('about')}</TabsTrigger>
            </TabsList>

            <TabsContent value="main">
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

            <TabsContent value="settings">
              <SettingsScreen />
            </TabsContent>

            <TabsContent value="about">
              <AboutScreen onOpenExternal={openExternal} />
            </TabsContent>
          </Tabs>

          <footer className="flex flex-col gap-3 border-t border-border/40 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>
              {t('authorLabel')}: {appMeta.author}
            </span>
            <span>
              {t('versionLabel')}: v{appMeta.version}
            </span>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
