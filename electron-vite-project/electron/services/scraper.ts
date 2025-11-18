import { app, BrowserWindow } from 'electron'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'

import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import sanitizeHtml, { type IOptions } from 'sanitize-html'

import type { AppSettings, FieldKey } from '@/types/settings'
import type { JobTickerItem, LogEntry, ProgressPayload, RunSummary, ScrapeStatus } from '@/types/ipc'

const preferenceMap: Record<number, string> = {
  1: 'Fully Remote',
  2: 'Hybrid',
  3: 'Temporary Remote',
  4: 'Office Only',
}

const typeMap: Record<number, string> = {
  1: 'Full-time',
  2: 'Internship',
  3: 'Part-time',
  4: 'Freelancer',
  5: 'Student',
}

const experienceMap: Record<number, string> = {
  1: 'No Experience',
  2: 'Fresh Graduate/Student',
  3: '<1 Yr Exp',
  4: '1-3 Yrs Exp',
  5: '3-5 Yrs Exp',
  6: '5-10 Yrs Exp',
  7: '>10 Yrs Exp',
}

const HAR_FILES = {
  list: 'moledao.io_api_career_list.har',
  detailChunks: ['moledao.io_api_career_details1.har', 'moledao.io_api_career_details2.har'],
}

const resolveHarBase = () => {
  const primary = path.join(process.env.APP_ROOT ?? __dirname, 'har')
  if (fsSync.existsSync(primary)) return primary
  return path.resolve(process.env.APP_ROOT ?? __dirname, '../har')
}

const HAR_BASE = resolveHarBase()
const regionFormatter = new Intl.DisplayNames(['en'], { type: 'region' })
const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const TICKER_BATCH_SIZE = 3
const TICKER_DELAY_MS = 1100

const sanitizeOptions: IOptions = {
  allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i'],
  allowedAttributes: {},
}

interface ListEntry {
  id: string
  name: string
  belonging: { name: string }
  career: { preferences?: number; type?: number; base?: string }
  updateDate: string
}

interface DetailEntry extends ListEntry {
  career: ListEntry['career'] & { experience?: number }
  content?: { content?: string }
  tags?: { name: string }[]
}

interface HarEntry {
  request?: { url?: string }
  response?: { content?: { text?: string; encoding?: string } }
}

interface NormalizedJob {
  id: string
  company: string
  role: string
  typeText: string
  preferenceText: string
  experienceText: string
  location: string
  tagText: string
  contentParagraphs: string[]
  relativeTime: string
  updateDate: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const safeJsonParse = <T>(raw?: string): T | undefined => {
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch (error) {
    console.warn('Failed to parse JSON', error)
    return undefined
  }
}

const decodeHarPayload = (text?: string, encoding?: string) => {
  if (!text) return ''
  if (encoding === 'base64') {
    return Buffer.from(text, 'base64').toString('utf-8')
  }
  return text
}

const formatRelativeTime = (isoString: string) => {
  const date = new Date(isoString)
  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)
  const absMinutes = Math.abs(diffMinutes)
  if (absMinutes < 60) {
    return relativeFormatter.format(Math.round(diffMinutes), 'minute')
  }
  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 48) {
    return relativeFormatter.format(diffHours, 'hour')
  }
  const diffDays = Math.round(diffHours / 24)
  if (Math.abs(diffDays) < 60) {
    return relativeFormatter.format(diffDays, 'day')
  }
  const diffWeeks = Math.round(diffDays / 7)
  if (Math.abs(diffWeeks) < 52) {
    return relativeFormatter.format(diffWeeks, 'week')
  }
  const diffMonths = Math.round(diffDays / 30)
  if (Math.abs(diffMonths) < 18) {
    return relativeFormatter.format(diffMonths, 'month')
  }
  const diffYears = Math.round(diffDays / 365)
  return relativeFormatter.format(diffYears, 'year')
}

const deriveCountry = (base?: string) => {
  if (!base) return ''
  const parsed = safeJsonParse<Array<{ value?: { country?: string; city?: string } }>>(base)
  const raw = parsed?.find((item) => item?.value?.country)?.value?.country
  if (!raw) return ''
  if (raw.length === 2) {
    return regionFormatter.of(raw.toUpperCase()) ?? raw
  }
  return raw
}

const sanitizeContent = (html?: string): string[] => {
  if (!html) return []
  const sanitized = sanitizeHtml(html, sanitizeOptions)
    .replace(/<br\s*\/?>(\s*)/gi, '\n')
    .replace(/<\/(p|div)>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\n{2,}/g, '\n')
  return sanitized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

const chunkArray = <T>(items: T[], size: number) => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

export class ScraperService {
  private running = false
  private cancelRequested = false
  private lastSummary: RunSummary | null = null

  constructor(private getWindow: () => BrowserWindow | null) {}

  getLastSummary() {
    return this.lastSummary
  }

  async start(settings: AppSettings) {
    if (this.running) {
      this.emitLog({ level: 'info', message: 'Scrape already running.' })
      return
    }

    this.cancelRequested = false
    this.running = true
    this.emitStatus('running')

    try {
      const listEntries = await this.loadList()
      if (!listEntries.length) {
        this.emitLog({ level: 'info', message: 'No jobs found in HAR snapshot.' })
        this.emitStatus('completed')
        this.running = false
        return
      }
      const detailMap = await this.loadDetails()
      const normalizedJobs: NormalizedJob[] = []
      const tickerBuffer: JobTickerItem[] = []

      for (let index = 0; index < listEntries.length; index += 1) {
        if (this.cancelRequested) break
        const entry = listEntries[index]
        const detail = detailMap.get(entry.id) ?? (entry as DetailEntry)
        const normalized = this.normalizeJob(entry, detail)
        normalizedJobs.push(normalized)

        this.emitLog({ message: `[${normalized.company}][${normalized.role}]-[${normalized.preferenceText}]`, level: 'info' })
        this.emitProgress({ processed: index + 1, total: listEntries.length })

        tickerBuffer.push({ id: normalized.id, company: normalized.company, title: normalized.role, preference: normalized.preferenceText })
        if (tickerBuffer.length >= TICKER_BATCH_SIZE || index === listEntries.length - 1) {
          this.emitJobBatch([...tickerBuffer])
          tickerBuffer.length = 0
          await sleep(TICKER_DELAY_MS)
        }
      }

      if (this.cancelRequested) {
        this.emitStatus('idle')
        this.cancelRequested = false
        this.running = false
        return
      }

      const summary = await this.exportDocs(normalizedJobs, settings)
      this.lastSummary = summary
      this.emitSummary(summary)
      this.emitStatus('completed')
    } catch (error) {
      console.error(error)
      this.emitLog({ level: 'error', message: `Scrape failed: ${(error as Error).message}` })
      this.emitStatus('error')
    } finally {
      this.running = false
    }
  }

  cancel() {
    if (!this.running) return
    this.cancelRequested = true
    this.emitLog({ level: 'info', message: 'Cancellation requested…' })
  }

  private async exportDocs(jobs: NormalizedJob[], settings: AppSettings): Promise<RunSummary> {
    const outputDirectory = settings.outputDirectory?.trim() || path.join(app.getPath('documents'), 'YuanJunjie-AiGrabber')
    await fs.mkdir(outputDirectory, { recursive: true })

    const chunkSize = settings.jobsPerDoc || 10
    const chunks = chunkArray(jobs, chunkSize)
    const files: string[] = []

    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index]
      const document = new Document({
        sections: [
          {
            children: chunk.flatMap((job, jobIndex) => this.renderJob(job, settings, jobIndex === chunk.length - 1)),
          },
        ],
      })
      const buffer = await Packer.toBuffer(document)
      const fileName = `jobs-${String(index + 1).padStart(3, '0')}.docx`
      await fs.writeFile(path.join(outputDirectory, fileName), buffer)
      files.push(fileName)
    }

    return { outputDirectory, files }
  }

  private renderJob(job: NormalizedJob, settings: AppSettings, isLastInChunk: boolean) {
    const children: Paragraph[] = []
    children.push(new Paragraph({ text: job.company, heading: HeadingLevel.HEADING_1 }))
    children.push(new Paragraph({ text: `${job.role} (${job.typeText})`, heading: HeadingLevel.HEADING_2 }))

    const orderedFields = settings.fieldOrder.filter((field) => !settings.hiddenFields.includes(field))
    const fieldLines: Record<FieldKey, string> = {
      location: `Location: ${job.location || '-'}`,
      type: `Type: ${job.typeText}`,
      preferences: `Preferences: ${job.preferenceText}`,
      experience: `Exp: ${job.experienceText}`,
      tag: `Tag: ${job.tagText || '-'}`,
    }

    orderedFields.forEach((field) => {
      children.push(new Paragraph({ text: fieldLines[field] }))
    })

    children.push(new Paragraph({ children: [new TextRun({ text: 'content:', bold: true })] }))
    job.contentParagraphs.forEach((line: string) => {
      children.push(new Paragraph({ text: line }))
    })

    children.push(new Paragraph({ text: job.relativeTime }))
    children.push(new Paragraph({ text: `time: ${job.updateDate}` }))
    if (!isLastInChunk) {
      children.push(new Paragraph({ text: '' }))
    }
    return children
  }

  private normalizeJob(listEntry: ListEntry, detailEntry: DetailEntry): NormalizedJob {
    const preferenceText = preferenceMap[detailEntry.career.preferences ?? listEntry.career.preferences ?? 0] ?? 'Unknown'
    const typeText = typeMap[detailEntry.career.type ?? listEntry.career.type ?? 0] ?? 'Unknown'
    const experienceText = experienceMap[detailEntry.career.experience ?? 0] ?? 'Unspecified'
    const location = deriveCountry(detailEntry.career.base ?? listEntry.career.base) || 'Unknown'
    const contentParagraphs = sanitizeContent(detailEntry.content?.content) ?? []
    const tagText = detailEntry.tags?.map((tag) => tag.name).join(', ') ?? ''

    return {
      id: listEntry.id,
      company: detailEntry.belonging?.name ?? listEntry.belonging?.name ?? 'Unknown',
      role: detailEntry.name ?? listEntry.name,
      typeText,
      preferenceText,
      experienceText,
      location,
      tagText,
      contentParagraphs: contentParagraphs.length ? contentParagraphs : ['No description provided.'],
      relativeTime: formatRelativeTime(detailEntry.updateDate ?? listEntry.updateDate),
      updateDate: detailEntry.updateDate ?? listEntry.updateDate,
    }
  }

  private async loadList(): Promise<ListEntry[]> {
    const filePath = path.join(HAR_BASE, HAR_FILES.list)
    const raw = await fs.readFile(filePath, 'utf-8')
    const har = JSON.parse(raw) as { log: { entries: HarEntry[] } }
    const entry = har.log.entries.find((item) => item.request?.url?.includes('/career/list'))
    if (!entry) return []
    const payload = decodeHarPayload(entry.response?.content?.text, entry.response?.content?.encoding)
    const data = safeJsonParse<{ data?: { list?: ListEntry[] } }>(payload)
    return data?.data?.list ?? []
  }

  private async loadDetails(): Promise<Map<string, DetailEntry>> {
    const map = new Map<string, DetailEntry>()
    for (const fileName of HAR_FILES.detailChunks) {
      const filePath = path.join(HAR_BASE, fileName)
      const raw = await fs.readFile(filePath, 'utf-8')
      const har = JSON.parse(raw) as { log: { entries: HarEntry[] } }
      for (const entry of har.log.entries) {
        if (!entry.request?.url?.includes('/career/details')) continue
        const payload = decodeHarPayload(entry.response?.content?.text, entry.response?.content?.encoding)
        const parsed = safeJsonParse<{ data?: DetailEntry }>(payload)
        if (parsed?.data?.id) {
          map.set(parsed.data.id, parsed.data)
        }
      }
    }
    return map
  }

  private emitStatus(status: ScrapeStatus) {
    this.sendToRenderer('scrape:status', status)
  }

  private emitLog(entry: Omit<LogEntry, 'id' | 'timestamp'> & { message: string }) {
    const payload: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: Date.now(),
      level: entry.level,
      message: entry.message,
    }
    this.sendToRenderer('scrape:log', payload)
  }

  private emitJobBatch(batch: JobTickerItem[]) {
    this.sendToRenderer('scrape:job-batch', batch)
  }

  private emitProgress(payload: ProgressPayload) {
    this.sendToRenderer('scrape:progress', payload)
  }

  private emitSummary(summary: RunSummary) {
    this.sendToRenderer('scrape:summary', summary)
  }

  private sendToRenderer<T>(channel: string, payload: T) {
    const window = this.getWindow()
    if (!window) return
    window.webContents.send(channel, payload)
  }
}
