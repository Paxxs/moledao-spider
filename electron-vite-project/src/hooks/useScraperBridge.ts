import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  ElectronAPI,
  JobTickerItem,
  LogEntry,
  ProgressPayload,
  RunSummary,
  ScrapeStatus,
} from '@/types/ipc'

const MAX_LOG_LINES = 200
const SIMULATION_JOB_DELAY_MS = 2200
const SIMULATION_BATCH_PAUSE_MS = 2800
const JOB_DISPLAY_WINDOW = 3600

const sampleJobs: JobTickerItem[] = [
  { id: '1', company: 'GREENWICH OASIS CAPITAL', title: 'Fund Operations Specialist', preference: 'Office Only' },
  { id: '2', company: 'Block Eden', title: 'Web3 Community Manager', preference: 'Fully Remote' },
  { id: '3', company: 'Moledao Labs', title: 'DeFi Researcher', preference: 'Hybrid' },
  { id: '4', company: 'Merlin Tech', title: 'Front-end Engineer', preference: 'Temporary Remote' },
  { id: '5', company: 'Genesis Labs', title: 'AI Product Lead', preference: 'Fully Remote' },
  { id: '6', company: 'MetaPeak', title: 'Data Strategist', preference: 'Office Only' },
]

const getApi = (): ElectronAPI | undefined => window.electronAPI

export const useScraperBridge = () => {
  const [status, setStatus] = useState<ScrapeStatus>('idle')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [tickerJobs, setTickerJobs] = useState<JobTickerItem[]>([])
  const [progress, setProgress] = useState<ProgressPayload | null>(null)
  const [summary, setSummary] = useState<RunSummary | null>(null)
  const [jobCycle, setJobCycle] = useState(0)
  const [bridgeReady, setBridgeReady] = useState(() => Boolean(getApi()))

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const cancelTimers = useCallback(() => {
    timers.current.forEach((id) => clearTimeout(id))
    timers.current = []
  }, [])

  useEffect(() => setBridgeReady(Boolean(getApi())), [])

  useEffect(() => {
    const api = getApi()
    if (!api) return
    const disposers = [
      api.onStatus((next) => {
        setStatus(next)
        if (next === 'idle') {
          setProgress(null)
          setSummary(null)
        }
      }),
      api.onLog((entry) => {
        setLogs((prev) => [...prev.slice(-(MAX_LOG_LINES - 1)), entry])
      }),
      api.onJobBatch((batch) => {
        setTickerJobs(batch)
        setJobCycle((cycle) => cycle + 1)
      }),
      api.onProgress((payload) => setProgress(payload)),
      api.onSummary((payload) => {
        setSummary(payload)
        setStatus('completed')
      }),
    ]
    return () => {
      disposers.forEach((dispose) => dispose?.())
    }
  }, [])

  useEffect(() => {
    if (!tickerJobs.length) return
    const timeout = setTimeout(() => setTickerJobs([]), JOB_DISPLAY_WINDOW)
    return () => clearTimeout(timeout)
  }, [tickerJobs, jobCycle])

  useEffect(() => () => cancelTimers(), [cancelTimers])

  const runSimulation = useCallback(() => {
    cancelTimers()
    setStatus('running')
    setLogs([])
    setProgress({ processed: 0, total: sampleJobs.length })
    setSummary(null)

    sampleJobs.forEach((job, index) => {
      const delay = index * SIMULATION_JOB_DELAY_MS
      const timer = setTimeout(() => {
        setLogs((prev) => [
          ...prev.slice(-(MAX_LOG_LINES - 1)),
          { id: `${Date.now()}-${index}`, level: 'info', message: `[${job.company}][${job.title}]-[${job.preference}]`, timestamp: Date.now() },
        ])
        setTickerJobs([job])
        setJobCycle((cycle) => cycle + 1)
        setProgress({ processed: index + 1, total: sampleJobs.length })
        if (index === sampleJobs.length - 1) {
          const doneTimer = setTimeout(() => {
            setSummary({ outputDirectory: '/tmp/mock-output', files: ['jobs-001.docx'] })
            setStatus('completed')
          }, SIMULATION_BATCH_PAUSE_MS)
          timers.current.push(doneTimer)
        }
      }, delay)
      timers.current.push(timer)
    })
  }, [cancelTimers])

  const cancelSimulation = useCallback(() => {
    cancelTimers()
    setStatus('idle')
    setProgress(null)
    setSummary(null)
    setTickerJobs([])
  }, [cancelTimers])

  const startScrape = useCallback(async () => {
    const api = getApi()
    if (!api) {
      runSimulation()
      return
    }
    setSummary(null)
    await api.startScrape()
  }, [runSimulation])

  const cancelScrape = useCallback(async () => {
    const api = getApi()
    if (!api) {
      cancelSimulation()
      return
    }
    await api.cancelScrape()
  }, [cancelSimulation])

  const openSummaryFolderAndExit = useCallback(async () => {
    const api = getApi()
    if (api) {
      await api.openSummaryFolderAndExit()
    }
  }, [])

  const openExternal = useCallback(async (url: string) => {
    const api = getApi()
    if (api) {
      await api.openExternalLink(url)
      return
    }
    window.open(url, '_blank')
  }, [])

  return {
    status,
    logs,
    tickerJobs,
    progress,
    summary,
    startScrape,
    cancelScrape,
    openSummaryFolderAndExit,
    openExternal,
    canControl: bridgeReady,
  }
}
