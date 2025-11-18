import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Info, Settings, Terminal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedOrb } from '@/components/main/AnimatedOrb'
import { LogsPanel } from '@/components/main/LogsPanel'
import { appMeta } from '@/lib/meta'
import type { JobTickerItem, LogEntry, ProgressPayload, RunSummary, ScrapeStatus } from '@/types/ipc'

const statusColorMap: Record<ScrapeStatus, string> = {
  idle: 'bg-muted text-muted-foreground',
  running: 'bg-amber-400 text-emerald-200 text-black',
  completed: 'bg-blue-500 text-emerald-200',
  error: 'bg-red-700 text-red-200',
}

interface Props {
  status: ScrapeStatus
  logs: LogEntry[]
  jobs: JobTickerItem[]
  progress: ProgressPayload | null
  summary: RunSummary | null
  isHydrated: boolean
  onStart: () => Promise<void>
  onCancel: () => Promise<void>
  onOpenSummary: () => Promise<void>
  onNavigate: (view: 'settings' | 'about') => void
}

export const MainScreen = ({
  status,
  logs,
  jobs,
  progress,
  summary,
  isHydrated,
  onStart,
  onCancel,
  onOpenSummary,
  onNavigate,
}: Props) => {
  const { t } = useTranslation()
  const isRunning = status === 'running'
  const isCompleted = status === 'completed'
  const canStart = isHydrated && status !== 'running'
  const totalWordCount = progress?.wordCount ?? 0
  const aiCostUsd = progress?.aiCostUsd ?? 0
  const formattedWordCount = useMemo(() => totalWordCount.toLocaleString(), [totalWordCount])
  const formattedAiCost = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(aiCostUsd), [aiCostUsd])
  const [wagePulse, setWagePulse] = useState(false)
  const lastCostRef = useRef(aiCostUsd)
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const previous = lastCostRef.current
    if (aiCostUsd > previous) {
      setWagePulse(true)
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current)
      }
      pulseTimeoutRef.current = setTimeout(() => {
        setWagePulse(false)
        pulseTimeoutRef.current = null
      }, 650)
    }
    lastCostRef.current = aiCostUsd
    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current)
        pulseTimeoutRef.current = null
      }
    }
  }, [aiCostUsd])

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AnimatedOrb
          status={status}
          jobs={jobs}
          idleText={t('idleStatus')}
          runningText={t('runningStatus')}
          completedText={t('completeStatus')}
        />

        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{appMeta.author}</p>
              <h3 className="text-2xl font-semibold leading-tight">{appMeta.name}</h3>
            </div>
            <Badge variant="outline" className={statusColorMap[status]}>
              {status.toUpperCase()}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{t('appTagline')}</p>

          <div className="grid gap-3 text-sm">
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{t('logs')}</p>
              <p className="mt-2 text-xl font-semibold text-white/90">
                {progress ? (
                  <span>
                    {progress.processed}/{progress.total}
                    <span className="pl-1 text-sm font-normal text-muted-foreground">{t('jobsLabel')}</span>
                  </span>
                ) : (
                  <span className="text-base font-normal text-muted-foreground">{t('idleStatus')}</span>
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 via-sky-500/20 to-emerald-500/20 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{t('aiWageTitle')}</p>
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <span className={`inline-flex items-center text-2xl font-semibold dark:text-emerald-200 text-blue-500 ${wagePulse ? 'wage-pulse' : ''}`}>
                  {formattedAiCost}
                </span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-muted-foreground">{t('aiWageRateLabel')}</span>
              </div>
              <p className="mt-1 text-base dark:text-white/90 text-black/60">{t('aiWageWordsLabel', { count: formattedWordCount })}</p>
              <p className="mt-2 text-xs text-muted-foreground">{t('aiWageHint')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" className="group" disabled={!canStart} onClick={() => (isRunning ? onCancel() : onStart())}>
              {isRunning ? t('stopScraping') : t('startScraping')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => onNavigate('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              {t('settings')}
            </Button>
          </div>

          <Button variant="ghost" className="justify-start text-muted-foreground" onClick={() => onNavigate('about')}>
            <Info className="mr-2 h-4 w-4" />
            {t('openAbout')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <LogsPanel logs={logs} title={t('logs')} emptyText={t('logsEmpty')} className="lg:w-2/3" />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground bg-sky-500/30 backdrop-blur-md lg:flex-1">
          <div className="flex items-center gap-3 text-base text-black dark:text-white">
            <Terminal className="h-4 w-4" />
            <span>{t('runningStatus')}</span>
          </div>
          <p className="mt-3 text-muted-foreground">{t('orbHint')}</p>
          {isCompleted && summary && (
            <Button className="mt-6 w-full" onClick={() => onOpenSummary()}>
              {t('exitAndOpen')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
