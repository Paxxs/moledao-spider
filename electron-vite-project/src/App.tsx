import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAppLocale } from '@/hooks/useAppLocale'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { appMeta } from '@/lib/meta'
import '@/lib/i18n'
import { useSettingsStore } from '@/store/settings'

const PlaceholderPanel = () => {
  const { t } = useTranslation()
  return (
    <Card className="border-dashed border-muted-foreground/30">
      <CardHeader>
        <CardTitle>{t('viewMain')}</CardTitle>
        <CardDescription>{t('orbHint')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>{t('jobTickerPlaceholder')}</p>
        <p>{t('logsEmpty')}</p>
      </CardContent>
    </Card>
  )
}

const PlaceholderSettings = () => {
  const { t } = useTranslation()
  return (
    <Card className="border-dashed border-muted-foreground/30">
      <CardHeader>
        <CardTitle>{t('settingsTitle')}</CardTitle>
        <CardDescription>{t('languageHint')}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {t('fieldHelp')}
      </CardContent>
    </Card>
  )
}

function App() {
  const { t } = useTranslation()
  const hydrate = useSettingsStore((state) => state.hydrate)
  const loaded = useSettingsStore((state) => state.loaded)

  useSystemTheme()
  useAppLocale()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-background/60 text-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
          <header className="flex flex-col gap-2 text-center md:text-left">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{appMeta.author}</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">{appMeta.name}</h1>
            <p className="text-base text-muted-foreground md:text-lg">{t('appTagline')}</p>
          </header>

          <Separator className="opacity-40" />

          <main className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
            <PlaceholderPanel />
            <div className="flex flex-col gap-6">
              <PlaceholderSettings />
              <Card>
                <CardHeader>
                  <CardTitle>{t('aboutTitle')}</CardTitle>
                  <CardDescription>{appMeta.contact}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <p className="text-sm text-muted-foreground">{t('aboutDescription')}</p>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </main>

          <footer className="flex flex-col gap-4 border-t border-border/40 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{t('authorLabel')}: {appMeta.author}</span>
              <span>·</span>
              <Button variant="link" className="h-auto p-0 text-sm text-primary" onClick={() => window.open?.(appMeta.contact, '_blank')}>
                {t('contactLabel')}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={!loaded}>{t('openSettings')}</Button>
              <Button disabled={!loaded}>{t('startScraping')}</Button>
            </div>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
