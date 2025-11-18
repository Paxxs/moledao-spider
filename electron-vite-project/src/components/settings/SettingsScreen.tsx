import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FolderOpen, GripVertical, Languages, Rows2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { supportedLocales } from '@/lib/i18n'
import { useSettingsStore } from '@/store/settings'
import { FIELD_LABEL_MAP, type FieldKey } from '@/types/settings'

const SortableFieldRow = ({
  id,
  label,
  hidden,
  onToggle,
  visibilityLabel,
}: {
  id: FieldKey
  label: string
  hidden: boolean
  onToggle: (id: FieldKey) => void
  visibilityLabel: string
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-background/80 px-3 py-2 ${isDragging ? 'shadow-xl' : ''}`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab rounded-full border border-border/60 p-1 text-muted-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{visibilityLabel}</span>
        <Switch checked={!hidden} onCheckedChange={() => onToggle(id)}>
          <span className="sr-only">toggle visibility</span>
        </Switch>
      </div>
    </div>
  )
}

export const SettingsScreen = () => {
  const { t } = useTranslation()
  const settings = useSettingsStore((state) => state.settings)
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const persist = useSettingsStore((state) => state.persist)

  const sensors = useSensors(useSensor(PointerSensor))

  const applyChange = useCallback(
    (updater: (prev: typeof settings) => typeof settings) => {
      updateSettings(updater)
      void persist()
    },
    [persist, updateSettings]
  )

  const handleBrowse = async () => {
    const directory = await window.electronAPI?.selectDirectory()
    if (directory) {
      applyChange((prev) => ({ ...prev, outputDirectory: directory }))
    }
  }

  const handleLanguageChange = (value: string) => {
    if (value === 'system' || supportedLocales.some((locale) => locale.code === value)) {
      applyChange((prev) => ({ ...prev, language: value as typeof settings.language }))
    }
  }

  const handleJobsChange = (value: number) => {
    const nextValue = Math.min(20, Math.max(1, value))
    applyChange((prev) => ({ ...prev, jobsPerDoc: nextValue }))
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = settings.fieldOrder.indexOf(active.id as FieldKey)
    const newIndex = settings.fieldOrder.indexOf(over.id as FieldKey)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(settings.fieldOrder, oldIndex, newIndex)
    applyChange((prev) => ({ ...prev, fieldOrder: reordered }))
  }

  const handleToggleVisibility = (key: FieldKey) => {
    const hiddenSet = new Set(settings.hiddenFields)
    if (hiddenSet.has(key)) {
      hiddenSet.delete(key)
    } else {
      hiddenSet.add(key)
    }
    applyChange((prev) => ({ ...prev, hiddenFields: Array.from(hiddenSet) }))
  }

  const resolveLabel = (key: FieldKey) => t(FIELD_LABEL_MAP[key].i18nKey)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('outputDirectory')}</CardTitle>
          <CardDescription>{t('outputDirectoryHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('outputDirectory')}</Label>
            <div className="flex gap-2">
              <Input readOnly value={settings.outputDirectory ?? t('selectFolder')} />
              <Button variant="secondary" onClick={handleBrowse}>
                <FolderOpen className="mr-2 h-4 w-4" />
                {t('browse')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('jobsPerDoc')}</Label>
            <Input
              type="number"
              value={settings.jobsPerDoc}
              onChange={(event) => handleJobsChange(Number(event.target.value))}
              min={1}
              max={20}
            />
            <p className="text-xs text-muted-foreground">{t('jobsPerDocHint')}</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {t('language')}
            </Label>
            <Select value={settings.language} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('systemDefault')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">{t('systemDefault')}</SelectItem>
                {supportedLocales.map((locale) => (
                  <SelectItem key={locale.code} value={locale.code}>
                    {locale.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('languageHint')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('fieldOrder')}</CardTitle>
          <CardDescription>{t('fieldHelp')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[340px] pr-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={settings.fieldOrder} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {settings.fieldOrder.map((field) => (
                    <SortableFieldRow
                      key={field}
                      id={field}
                      label={resolveLabel(field)}
                      hidden={settings.hiddenFields.includes(field)}
                      onToggle={handleToggleVisibility}
                      visibilityLabel={
                        settings.hiddenFields.includes(field) ? t('fieldHidden') : t('fieldVisible')
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('settingsTitle')}</CardTitle>
          <CardDescription>{t('fieldHelp')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Rows2 className="h-4 w-4" />
            <span>
              {settings.fieldOrder.length - settings.hiddenFields.length} / {settings.fieldOrder.length} {t('visibleFields') ?? ''}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
