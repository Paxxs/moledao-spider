import { motion } from 'framer-motion'
import { useMemo } from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { LogEntry } from '@/types/ipc'

interface Props {
  logs: LogEntry[]
  title: string
  emptyText: string
}

export const LogsPanel = ({ logs, title, emptyText }: Props) => {
  const formatted = useMemo(
    () =>
      logs.map((item) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      })),
    [logs]
  )

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{logs.length}</span>
      </div>
      <ScrollArea className="grow">
        <div className="space-y-2 pr-2">
          {formatted.length === 0 && <p className="text-sm text-muted-foreground/80">{emptyText}</p>}
          {formatted.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('rounded-xl border px-3 py-2 text-xs', entry.level === 'error' ? 'border-red-500/40 text-red-200' : 'border-white/10 text-white/90')}
            >
              <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                <span>{entry.time}</span>
                <span className="uppercase tracking-[0.3em]">{entry.level}</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-white/90">{entry.message}</p>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
