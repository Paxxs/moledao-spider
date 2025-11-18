import { CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

import type { JobTickerItem } from '@/types/ipc'

const orbLayers = [
  { size: 220, color: 'linear-gradient(135deg, rgba(168, 85, 247, 0.65), rgba(236, 72, 153, 0.5), rgba(6, 182, 212, 0.6))', duration: 9 },
  { size: 280, color: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.45), rgba(14, 165, 233, 0.5))', duration: 13 },
  { size: 340, color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(6, 182, 212, 0.35), rgba(168, 85, 247, 0.3))', duration: 17 },
]

const CARD_RADIUS = 120

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
  const positions = useMemo(() => {
    const total = Math.max(jobs.length, 4)
    return jobs.map((_, idx) => {
      const angle = ((idx % total) / total) * 360 + idx * 12
      const radians = (angle * Math.PI) / 180
      return {
        x: Math.cos(radians) * CARD_RADIUS,
        y: Math.sin(radians) * (CARD_RADIUS * 0.55),
      }
    })
  }, [jobs])

  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950/80 via-slate-900/40 to-slate-950/80 p-6">
      <div className="absolute inset-6 overflow-visible">
        {orbLayers.map((layer, index) => (
          <motion.div
            key={`orb-${index}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ width: layer.size, height: layer.size, backgroundImage: layer.color }}
            animate={{
              scale: [0.85, 1.1, 0.92],
              rotate: [0, 160, 320],
              opacity: [0.4, 0.85, 0.55],
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
          {jobs.map((job, idx) => {
            const { x, y } = positions[idx] ?? { x: 0, y: 0 }
            const float = (idx % 2 === 0 ? 1 : -1) * 18
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.8, 1, 1, 0.8],
                  x: [0, x * 0.6, x],
                  y: [0, y * 0.6, y + float],
                }}
                transition={{ duration: 3.6, delay: idx * 0.15, ease: 'easeInOut' }}
                className="absolute left-1/2 top-1/2 min-w-[220px] -translate-x-1/2 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-lg"
              >
                <p className="font-semibold leading-tight">{job.company}</p>
                <p className="text-xs text-white/80">{job.title}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.38em] text-emerald-200">{job.preference}</p>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
