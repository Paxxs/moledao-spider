import { CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

import type { JobTickerItem } from '@/types/ipc'

const orbLayers = [
  { size: 230, color: 'linear-gradient(135deg, rgba(168, 85, 247, 0.7), rgba(236, 72, 153, 0.6), rgba(6, 182, 212, 0.7))', duration: 8 },
  { size: 280, color: 'linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.4), rgba(14, 165, 233, 0.5))', duration: 12 },
  { size: 320, color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(6, 182, 212, 0.4), rgba(168, 85, 247, 0.3))', duration: 16 },
]

interface Props {
  status: 'idle' | 'running' | 'completed' | 'error'
  jobs: JobTickerItem[]
  idleText: string
  runningText: string
  completedText: string
}

export const AnimatedOrb = ({ status, jobs, idleText, runningText, completedText }: Props) => {
  const isRunning = status === 'running'
  const isCompleted = status === 'completed'

  const jobKey = useMemo(() => jobs.map((job) => job.id).join('-'), [jobs])

  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950/80 via-slate-900/40 to-slate-950/80 p-6">
      <div className="absolute inset-6 overflow-visible">
        {orbLayers.map((layer, index) => (
          <motion.div
            key={`orb-${index}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ width: layer.size, height: layer.size, backgroundImage: layer.color }}
            animate={{
              scale: [0.85, 1.08, 0.95],
              rotate: [0, 120, 240],
              opacity: [0.45, 0.9, 0.6],
            }}
            transition={{ duration: layer.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        {isCompleted ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-16 w-16 text-emerald-300" />
            <p className="text-lg font-semibold text-emerald-100">{completedText}</p>
          </motion.div>
        ) : (
          <motion.p key={status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-medium text-muted-foreground">
            {isRunning ? runningText : idleText}
          </motion.p>
        )}
      </div>

      {isRunning && jobs.length > 0 && (
        <motion.div key={jobKey} className="pointer-events-none absolute inset-0 z-20">
          {jobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.05, 0.7], y: [-20, -80, -120], x: [-20 + idx * 10, 0, 20 - idx * 10] }}
              transition={{ duration: 2.3, delay: idx * 0.2, ease: 'easeInOut' }}
              className="absolute left-1/2 top-1/2 min-w-[220px] -translate-x-1/2 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-lg"
            >
              <p className="font-semibold leading-tight">{job.company}</p>
              <p className="text-xs text-white/80">{job.title}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.38em] text-emerald-200">{job.preference}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
