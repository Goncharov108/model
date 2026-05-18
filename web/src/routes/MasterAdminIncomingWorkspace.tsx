import { useEffect, useMemo, useState } from 'react'
import type {
  TelegramNoteFolder,
  TelegramNoteGroup,
  TelegramNoteItem,
  TelegramNotePriority,
  TelegramNoteState,
  TelegramRoutingRuleSet,
} from '../domain/telegramNotes'
import type { TelegramNotesStoreState } from '../store/telegramNotesStore'
import { readTextFile } from '../lib/readTextFile'
import { countByGroup, parseTelegramNotesExport } from '../lib/telegramNotes'
import { useTelegramNotesStore } from '../store/telegramNotesStore'
import { AppButton } from '../ui/AppButton'
import { PageHeader } from '../ui/PageHeader'
import { SurfaceCard } from '../ui/SurfaceCard'
import { ConfirmDialog } from '../ui/ConfirmDialog'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30'

const GROUP_LABEL: Record<TelegramNoteGroup, string> = {
  video: 'Видео',
  link: 'Ссылки',
  text: 'Текст',
  photo: 'Фото',
  file: 'Файлы',
  other: 'Прочее',
}

const STATE_LABEL: Record<TelegramNoteState, string> = {
  inbox: 'Входящие',
  in_work: 'В работе',
  archived: 'Архив',
}

const PRIORITY_LABEL: Record<TelegramNotePriority, string> = {
  high: 'Важно',
  normal: 'Обычно',
  low: 'Позже',
}

const FOLDER_LABEL: Record<TelegramNoteFolder, string> = {
  ideas: 'Идеи',
  work: 'Работа',
  finance: 'Финансы',
  media: 'Медиа',
  misc: 'Разное',
}

/** Селектор zustand с типом стора (Hermes TG-заметки). */
function useNotesStore<T>(selector: (s: TelegramNotesStoreState) => T): T {
  return useTelegramNotesStore(selector)
}

export function MasterAdminIncomingWorkspace() {
  const snapshot = useNotesStore((s) => s.snapshot)
  const setSnapshot = useNotesStore((s) => s.setSnapshot)
  const selectedIds = useNotesStore((s) => s.selectedIds)
  const routingPresets = useNotesStore((s) => s.routingPresets)
  const activePresetId = useNotesStore((s) => s.activePresetId)
  const setActivePreset = useNotesStore((s) => s.setActivePreset)
  const updateActivePreset = useNotesStore((s) => s.updateActivePreset)
  const createPreset = useNotesStore((s) => s.createPreset)
  const duplicateActivePreset = useNotesStore((s) => s.duplicateActivePreset)
  const renameActivePreset = useNotesStore((s) => s.renameActivePreset)
  const deleteActivePreset = useNotesStore((s) => s.deleteActivePreset)
  const applyQuickMode = useNotesStore((s) => s.applyQuickMode)
  const resetPresetsToDefault = useNotesStore((s) => s.resetPresetsToDefault)
  const exportPresets = useNotesStore((s) => s.exportPresets)
  const previewImportPresets = useNotesStore((s) => s.previewImportPresets)
  const importPresets = useNotesStore((s) => s.importPresets)
  const undoLastImport = useNotesStore((s) => s.undoLastImport)
  const setItemState = useNotesStore((s) => s.setItemState)
  const setItemFolder = useNotesStore((s) => s.setItemFolder)
  const applyStateToSelected = useNotesStore((s) => s.applyStateToSelected)
  const applyFolderToSelected = useNotesStore((s) => s.applyFolderToSelected)
  const toggleSelected = useNotesStore((s) => s.toggleSelected)
  const clearSelection = useNotesStore((s) => s.clearSelection)
  const selectAll = useNotesStore((s) => s.selectAll)
  const applyAutoRouting = useNotesStore((s) => s.applyAutoRouting)
  const clear = useNotesStore((s) => s.clear)

  const [groupFilter, setGroupFilter] = useState<TelegramNoteGroup | 'all'>('all')
  const [stateFilter, setStateFilter] = useState<TelegramNoteState | 'all'>('all')
  const [folderFilter, setFolderFilter] = useState<TelegramNoteFolder | 'all'>('all')
  const [query, setQuery] = useState('')
  const [presetName, setPresetName] = useState('')
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge')
  const [importPreview, setImportPreview] = useState<{ originalName: string; finalName: string; willRename: boolean }[]>([])
  const [importSummary, setImportSummary] = useState<string | null>(null)
  const [importConflicts, setImportConflicts] = useState<{ originalName: string; finalName: string }[]>([])
  const [importConflictQuery, setImportConflictQuery] = useState('')
  const [importConflictSortField, setImportConflictSortField] = useState<'originalName' | 'finalName'>('originalName')
  const [importConflictSortDirection, setImportConflictSortDirection] = useState<'asc' | 'desc'>('asc')
  const [dryRunSummary, setDryRunSummary] = useState<string | null>(null)
  const [pendingImportPayload, setPendingImportPayload] = useState<string | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importDialogDescription, setImportDialogDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const counters = useMemo(() => countByGroup(snapshot?.items ?? []), [snapshot])

  const stateCounters = useMemo(() => {
    const items = snapshot?.items ?? []
    return {
      inbox: items.filter((x) => x.state === 'inbox').length,
      in_work: items.filter((x) => x.state === 'in_work').length,
      archived: items.filter((x) => x.state === 'archived').length,
    }
  }, [snapshot])

  const folderCounters = useMemo(() => {
    const items = snapshot?.items ?? []
    return {
      ideas: items.filter((x) => x.folder === 'ideas').length,
      work: items.filter((x) => x.folder === 'work').length,
      finance: items.filter((x) => x.folder === 'finance').length,
      media: items.filter((x) => x.folder === 'media').length,
      misc: items.filter((x) => x.folder === 'misc').length,
    }
  }, [snapshot])

  const filteredItems = useMemo((): TelegramNoteItem[] => {
    const base = snapshot?.items ?? []
    return base.filter((item: TelegramNoteItem) => {
      if (groupFilter !== 'all' && item.group !== groupFilter) return false
      if (stateFilter !== 'all' && item.state !== stateFilter) return false
      if (folderFilter !== 'all' && item.folder !== folderFilter) return false
      if (!query.trim()) return true
      const haystack = `${item.text} ${item.links.join(' ')} ${item.tags.join(' ')}`.toLowerCase()
      return haystack.includes(query.toLowerCase())
    })
  }, [folderFilter, groupFilter, query, snapshot, stateFilter])

  const selectedCount = selectedIds.length
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedSet.has(item.id))
  const activePreset = useMemo(
    () => routingPresets.find((preset) => preset.id === activePresetId) ?? routingPresets[0],
    [activePresetId, routingPresets],
  )
  const isActivePresetLocked = Boolean(activePreset?.locked)
  const filteredImportConflicts = useMemo(() => {
    const q = importConflictQuery.trim().toLowerCase()
    if (!q) return importConflicts
    return importConflicts.filter((item) => `${item.originalName} ${item.finalName}`.toLowerCase().includes(q))
  }, [importConflictQuery, importConflicts])
  const sortedImportConflicts = useMemo(() => {
    const sorted = [...filteredImportConflicts].sort((a, b) => {
      const left = a[importConflictSortField].toLocaleLowerCase('ru')
      const right = b[importConflictSortField].toLocaleLowerCase('ru')
      if (left < right) return importConflictSortDirection === 'asc' ? -1 : 1
      if (left > right) return importConflictSortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredImportConflicts, importConflictSortDirection, importConflictSortField])

  useEffect(() => {
    setPresetName(activePreset?.name ?? '')
  }, [activePreset?.id, activePreset?.name])

  async function handleImport(file: File) {
    setBusy(true)
    setError(null)
    try {
      const text = await readTextFile(file)
      const parsed = parseTelegramNotesExport(text, file.name)
      setSnapshot(parsed)
      setGroupFilter('all')
      setStateFilter('all')
      setFolderFilter('all')
      setQuery('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось прочитать файл')
    } finally {
      setBusy(false)
    }
  }

  function downloadConflictsTxt() {
    if (importConflicts.length === 0) {
      window.alert('Список конфликтов пуст')
      return
    }
    const lines = importConflicts.map((item) => `${item.originalName} → ${item.finalName}`)
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'preset-import-conflicts.txt'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  async function copyConflictLine(originalName: string, finalName: string) {
    const line = `${originalName} → ${finalName}`
    try {
      await navigator.clipboard.writeText(line)
      setImportSummary(`Скопировано: ${line}`)
    } catch {
      window.alert('Не удалось скопировать строку')
    }
  }

  async function handleImportDryRun(file: File) {
    try {
      const text = await readTextFile(file)
      const preview = previewImportPresets(text, importMode)
      if (!preview.ok) {
        window.alert(preview.error ?? 'Не удалось проверить файл')
        return
      }
      const renamed = preview.items.filter((x) => x.willRename).length
      setDryRunSummary(
        `Сухой прогон: найдено ${preview.items.length} валидных, конфликтов ${renamed}, пропущено ${preview.skipped}. Без применения изменений.`,
      )
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Ошибка чтения файла')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Мастер-админ"
        title="Входящий поток · ТГ заметки"
        description="Этап 6: пользовательские пресеты и быстрые режимы авто-сортировки."
      />

      <SurfaceCard title="Импорт из Telegram">
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Файл экспорта (JSON)
            <input
              className={inputClass}
              type="file"
              accept="application/json,.json"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                await handleImport(file)
                e.currentTarget.value = ''
              }}
              disabled={busy}
            />
          </label>
          <div className="flex gap-2">
            <AppButton type="button" variant="ghost" onClick={() => applyAutoRouting()} disabled={!snapshot || busy}>
              Массовая сортировка
            </AppButton>
            <AppButton type="button" variant="ghost" onClick={() => clear()} disabled={!snapshot || busy}>
              Очистить
            </AppButton>
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-300">Ошибка: {error}</p> : null}
        {snapshot ? (
          <p className="mt-3 text-xs text-zinc-500">
            Источник: {snapshot.sourceName} · сообщений в экспорте: {snapshot.totalMessages} · убрано дублей: {snapshot.dedupedCount} ·
            итог заметок: {snapshot.items.length}
          </p>
        ) : (
          <p className="mt-3 text-xs text-zinc-500">
            Поддерживается обычный экспорт Telegram в JSON (Desktop → Export chat history).
          </p>
        )}
      </SurfaceCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <StatChip label="Всего" value={snapshot?.items.length ?? 0} />
        <StatChip label={GROUP_LABEL.video} value={counters.video} />
        <StatChip label={GROUP_LABEL.link} value={counters.link} />
        <StatChip label={GROUP_LABEL.text} value={counters.text} />
        <StatChip label={GROUP_LABEL.photo} value={counters.photo} />
        <StatChip label={GROUP_LABEL.other} value={counters.other + counters.file} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatChip label={STATE_LABEL.inbox} value={stateCounters.inbox} />
        <StatChip label={STATE_LABEL.in_work} value={stateCounters.in_work} />
        <StatChip label={STATE_LABEL.archived} value={stateCounters.archived} />
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        <StatChip label={FOLDER_LABEL.ideas} value={folderCounters.ideas} />
        <StatChip label={FOLDER_LABEL.work} value={folderCounters.work} />
        <StatChip label={FOLDER_LABEL.finance} value={folderCounters.finance} />
        <StatChip label={FOLDER_LABEL.media} value={folderCounters.media} />
        <StatChip label={FOLDER_LABEL.misc} value={folderCounters.misc} />
      </div>

      <SurfaceCard title="Фильтр и поиск">
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Группа
            <select className={inputClass} value={groupFilter} onChange={(e) => setGroupFilter(e.target.value as TelegramNoteGroup | 'all')}>
              <option value="all">Все</option>
              {(Object.keys(GROUP_LABEL) as TelegramNoteGroup[]).map((group) => (
                <option key={group} value={group}>{GROUP_LABEL[group]}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Статус
            <select className={inputClass} value={stateFilter} onChange={(e) => setStateFilter(e.target.value as TelegramNoteState | 'all')}>
              <option value="all">Все</option>
              {(Object.keys(STATE_LABEL) as TelegramNoteState[]).map((state) => (
                <option key={state} value={state}>{STATE_LABEL[state]}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Папка
            <select className={inputClass} value={folderFilter} onChange={(e) => setFolderFilter(e.target.value as TelegramNoteFolder | 'all')}>
              <option value="all">Все</option>
              {(Object.keys(FOLDER_LABEL) as TelegramNoteFolder[]).map((folder) => (
                <option key={folder} value={folder}>{FOLDER_LABEL[folder]}</option>
              ))}
            </select>
          </label>

          <label className="min-w-0 flex-1 flex flex-col gap-1 text-xs text-zinc-500">
            Поиск
            <input className={inputClass} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Искать по тексту, ссылкам и тегам…" />
          </label>
        </div>
      </SurfaceCard>

      <SurfaceCard title="Умные правила авто-сортировки" description="Выберите пресет и настройте, куда отправлять заметки по приоритету/папке.">
        {!activePreset ? (
          <p className="mt-4 text-sm text-zinc-500">Пресеты не найдены.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <label className="flex max-w-sm flex-col gap-1 text-xs text-zinc-500">
              Пресет
              <select className={inputClass} value={activePresetId} onChange={(e) => setActivePreset(e.target.value)}>
                {routingPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.name}{preset.locked ? ' · базовый' : ''}</option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-2">
              <AppButton type="button" variant="ghost" onClick={() => applyQuickMode('workday')}>Режим: Рабочий день</AppButton>
              <AppButton type="button" variant="ghost" onClick={() => applyQuickMode('incoming')}>Режим: Разбор входящих</AppButton>
              <AppButton type="button" variant="ghost" onClick={() => applyQuickMode('archive')}>Режим: Архивный</AppButton>
            </div>

            <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Название активного пресета
                <input className={inputClass} value={presetName} onChange={(e) => setPresetName(e.target.value)} />
              </label>
              <AppButton type="button" variant="ghost" onClick={() => renameActivePreset(presetName)}>Переименовать</AppButton>
              <AppButton type="button" variant="ghost" onClick={() => duplicateActivePreset()}>Дублировать</AppButton>
              <AppButton
                type="button"
                variant="ghost"
                onClick={() => {
                  if (isActivePresetLocked) return
                  const ok = window.confirm('Удалить текущий пользовательский пресет? Это действие нельзя отменить.')
                  if (ok) deleteActivePreset()
                }}
                disabled={isActivePresetLocked}
              >
                Удалить
              </AppButton>
            </div>

            <div className="flex flex-wrap gap-2">
              <AppButton type="button" variant="ghost" onClick={() => createPreset(presetName || 'Новый пресет')}>
                Создать новый пресет
              </AppButton>
              <AppButton
                type="button"
                variant="ghost"
                onClick={() => {
                  const payload = JSON.stringify(exportPresets(), null, 2)
                  const blob = new Blob([payload], { type: 'application/json' })
                  const link = document.createElement('a')
                  link.href = URL.createObjectURL(blob)
                  link.download = 'telegram-routing-presets.json'
                  link.click()
                  URL.revokeObjectURL(link.href)
                }}
              >
                Экспорт пресетов
              </AppButton>
              <label className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-300">
                Режим импорта:
                <select
                  className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
                >
                  <option value="merge">Добавить к текущим</option>
                  <option value="replace">Заменить пользовательские</option>
                </select>
              </label>
              <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-200 hover:border-violet-500/50">
                Импорт пресетов
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const text = await readTextFile(file)
                      const preview = previewImportPresets(text, importMode)
                      if (!preview.ok) {
                        window.alert(preview.error ?? 'Не удалось прочитать пресеты')
                        return
                      }
                      setDryRunSummary(null)
                      setImportPreview(preview.items)

                      const renamed = preview.items.filter((x) => x.willRename)
                      setImportConflicts(renamed.map((x) => ({ originalName: x.originalName, finalName: x.finalName })))
                      const descriptionLines = [
                        `Будет добавлено: ${preview.items.length}`,
                        `Переименовано из-за дублей: ${renamed.length}`,
                        `Пропущено невалидных: ${preview.skipped}`,
                      ]
                      setImportDialogDescription(descriptionLines.join('\n'))
                      setPendingImportPayload(text)
                      setImportConflictQuery('')
                      setImportConflictSortField('originalName')
                      setImportConflictSortDirection('asc')
                      setImportDialogOpen(true)
                    } catch (err) {
                      window.alert(err instanceof Error ? err.message : 'Ошибка чтения файла')
                    } finally {
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </label>
              <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-200 hover:border-violet-500/50">
                Сухой прогон
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    await handleImportDryRun(file)
                    e.currentTarget.value = ''
                  }}
                />
              </label>
              <AppButton
                type="button"
                variant="ghost"
                onClick={() => {
                  const result = undoLastImport()
                  if (!result.ok) {
                    window.alert(result.error ?? 'Откат недоступен')
                    return
                  }
                  setImportSummary('Последний импорт отменён')
                  setDryRunSummary(null)
                  setImportPreview([])
                  setImportConflicts([])
                  setImportConflictQuery('')
                  setImportConflictSortField('originalName')
                  setImportConflictSortDirection('asc')
                }}
              >
                Отменить последний импорт
              </AppButton>
              <AppButton
                type="button"
                variant="ghost"
                onClick={() => {
                  const ok = window.confirm('Сбросить все пресеты к базовым? Пользовательские пресеты будут удалены.')
                  if (ok) resetPresetsToDefault()
                }}
              >
                Сброс к базовым
              </AppButton>
            </div>

            {importSummary ? <p className="text-xs text-emerald-300">{importSummary}</p> : null}
            {dryRunSummary ? <p className="text-xs text-sky-300">{dryRunSummary}</p> : null}
            {importPreview.length > 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
                <p className="mb-2 text-zinc-400">Предпросмотр импорта (последний выбранный файл):</p>
                <ul className="space-y-1">
                  {importPreview.slice(0, 8).map((item, index) => (
                    <li key={`${item.originalName}-${index}`}>
                      {item.originalName}
                      {item.willRename ? ` → ${item.finalName}` : ''}
                    </li>
                  ))}
                </ul>
                {importPreview.length > 8 ? <p className="mt-2 text-zinc-500">И ещё: {importPreview.length - 8}</p> : null}
              </div>
            ) : null}

            <div className="grid gap-3 lg:grid-cols-3">
              {(Object.keys(PRIORITY_LABEL) as TelegramNotePriority[]).map((priority) => (
                <RuleSelect
                  key={`priority-${priority}`}
                  label={`Приоритет: ${PRIORITY_LABEL[priority]}`}
                  value={activePreset.priorityToState[priority]}
                  onChange={(state) =>
                    updateActivePreset({
                      priorityToState: { ...activePreset.priorityToState, [priority]: state },
                    } as Partial<TelegramRoutingRuleSet>)
                  }
                />
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {(Object.keys(FOLDER_LABEL) as TelegramNoteFolder[]).map((folder) => (
                <RuleSelect
                  key={`folder-${folder}`}
                  label={`Папка: ${FOLDER_LABEL[folder]}`}
                  value={activePreset.folderToState[folder] ?? activePreset.defaultState}
                  onChange={(state) =>
                    updateActivePreset({
                      folderToState: { ...activePreset.folderToState, [folder]: state },
                    } as Partial<TelegramRoutingRuleSet>)
                  }
                />
              ))}
            </div>

            <RuleSelect
              label="По умолчанию"
              value={activePreset.defaultState}
              onChange={(state) => updateActivePreset({ defaultState: state })}
            />

            <div>
              <AppButton type="button" variant="ghost" onClick={() => applyAutoRouting()} disabled={!snapshot || busy}>
                Применить правила сейчас
              </AppButton>
            </div>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard title="Массовые операции" description="Работает по выбранным заметкам в текущем списке.">
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <AppButton
            type="button"
            variant="ghost"
            onClick={() => (allFilteredSelected ? clearSelection() : selectAll(filteredItems.map((x) => x.id)))}
            disabled={!snapshot || filteredItems.length === 0}
          >
            {allFilteredSelected ? 'Снять выбор' : 'Выбрать всё в фильтре'}
          </AppButton>
          <span className="text-xs text-zinc-500">Выбрано: {selectedCount}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <AppButton type="button" variant="ghost" onClick={() => applyStateToSelected('in_work')} disabled={selectedCount === 0}>
            Выбранные → В работу
          </AppButton>
          <AppButton type="button" variant="ghost" onClick={() => applyStateToSelected('archived')} disabled={selectedCount === 0}>
            Выбранные → В архив
          </AppButton>
          <AppButton type="button" variant="ghost" onClick={() => applyStateToSelected('inbox')} disabled={selectedCount === 0}>
            Выбранные → Во входящие
          </AppButton>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">Переместить выбранные в папку:</span>
          {(Object.keys(FOLDER_LABEL) as TelegramNoteFolder[]).map((folder) => (
            <AppButton key={folder} type="button" variant="ghost" onClick={() => applyFolderToSelected(folder)} disabled={selectedCount === 0}>
              {FOLDER_LABEL[folder]}
            </AppButton>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard title="Лента заметок" description="Быстрые действия: в работу / в архив / вернуть во входящие.">
        {!snapshot ? (
          <p className="mt-4 text-sm text-zinc-500">Пока пусто. Загрузите JSON-экспорт из Telegram.</p>
        ) : filteredItems.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">По текущему фильтру ничего не найдено.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredItems.map((item) => (
              <article key={item.id} className={`rounded-xl border p-3 ${selectedSet.has(item.id) ? 'border-violet-500/60 bg-violet-950/20' : 'border-zinc-800 bg-zinc-900/50'}`}>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <label className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">
                    <input type="checkbox" checked={selectedSet.has(item.id)} onChange={() => toggleSelected(item.id)} />
                    Выбрать
                  </label>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">{GROUP_LABEL[item.group]}</span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">{FOLDER_LABEL[item.folder]}</span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">{PRIORITY_LABEL[item.priority]}</span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">{STATE_LABEL[item.state]}</span>
                  <span>{new Date(item.dateIso).toLocaleString('ru-RU')}</span>
                </div>
                {item.text ? <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-100">{item.text}</p> : null}
                {item.tags.length > 0 ? <div className="mt-2 flex flex-wrap gap-1">{item.tags.map((tag) => <span key={`${item.id}-${tag}`} className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-300">#{tag}</span>)}</div> : null}
                {item.links.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-violet-300">{item.links.map((link) => <li key={`${item.id}-${link}`}><a href={link} target="_blank" rel="noreferrer" className="hover:underline">{link}</a></li>)}</ul>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <AppButton type="button" variant="ghost" onClick={() => setItemState(item.id, 'in_work')}>В работу</AppButton>
                  <AppButton type="button" variant="ghost" onClick={() => setItemState(item.id, 'archived')}>В архив</AppButton>
                  <AppButton type="button" variant="ghost" onClick={() => setItemState(item.id, 'inbox')}>Во входящие</AppButton>
                  <label className="ml-auto flex items-center gap-2 text-xs text-zinc-400">
                    Папка:
                    <select className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100" value={item.folder} onChange={(e) => setItemFolder(item.id, e.target.value as TelegramNoteFolder)}>
                      {(Object.keys(FOLDER_LABEL) as TelegramNoteFolder[]).map((folder) => (
                        <option key={folder} value={folder}>{FOLDER_LABEL[folder]}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}
      </SurfaceCard>

      <ConfirmDialog
        open={importDialogOpen}
        title="Подтвердите импорт пресетов"
        description={<span className="whitespace-pre-line">{importDialogDescription}</span>}
        details={
          importConflicts.length > 0 ? (
            <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
              <p className="mb-2 text-xs font-medium text-zinc-300">Полный список конфликтов имён:</p>
              <label className="mb-2 block text-xs text-zinc-400">
                Поиск по конфликтам
                <input
                  className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
                  value={importConflictQuery}
                  onChange={(e) => setImportConflictQuery(e.target.value)}
                  placeholder="Введите часть старого или нового имени…"
                />
              </label>
              <div className="mb-2 grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-zinc-400">
                  Сортировать по
                  <select
                    className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
                    value={importConflictSortField}
                    onChange={(e) => setImportConflictSortField(e.target.value as 'originalName' | 'finalName')}
                  >
                    <option value="originalName">Старому имени</option>
                    <option value="finalName">Новому имени</option>
                  </select>
                </label>
                <label className="text-xs text-zinc-400">
                  Порядок
                  <select
                    className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
                    value={importConflictSortDirection}
                    onChange={(e) => setImportConflictSortDirection(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="asc">А → Я</option>
                    <option value="desc">Я → А</option>
                  </select>
                </label>
              </div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-zinc-500">
                  Показано: {sortedImportConflicts.length} из {importConflicts.length}
                </p>
                <AppButton type="button" variant="ghost" onClick={downloadConflictsTxt}>
                  Экспорт конфликтов .txt
                </AppButton>
              </div>
              <ul className="max-h-56 space-y-1 overflow-auto pr-1 text-xs text-zinc-400">
                {sortedImportConflicts.map((item, index) => (
                  <li key={`${item.originalName}-${item.finalName}-${index}`} className="flex items-start justify-between gap-2 break-words rounded border border-zinc-800 bg-zinc-900/60 p-2">
                    <span className="min-w-0 break-words">{item.originalName} → {item.finalName}</span>
                    <AppButton type="button" variant="ghost" onClick={() => void copyConflictLine(item.originalName, item.finalName)}>
                      Скопировать
                    </AppButton>
                  </li>
                ))}
              </ul>
              {sortedImportConflicts.length === 0 ? (
                <p className="mt-2 text-xs text-zinc-500">Ничего не найдено по текущему запросу.</p>
              ) : null}
            </div>
          ) : null
        }
        confirmLabel="Импортировать"
        cancelLabel="Отмена"
        onCancel={() => {
          setImportDialogOpen(false)
          setPendingImportPayload(null)
          setDryRunSummary(null)
          setImportConflicts([])
          setImportConflictQuery('')
          setImportConflictSortField('originalName')
          setImportConflictSortDirection('asc')
        }}
        onConfirm={() => {
          if (!pendingImportPayload) return
          const result = importPresets(pendingImportPayload, importMode)
          if (!result.ok) {
            window.alert(result.error ?? 'Не удалось импортировать пресеты')
            return
          }
          setImportSummary(
            `Импорт выполнен: добавлено ${result.added}, переименовано ${result.renamed}, пропущено ${result.skipped}`,
          )
          setPendingImportPayload(null)
        }}
      />
    </div>
  )
}

function RuleSelect(props: {
  label: string
  value: TelegramNoteState
  onChange: (state: TelegramNoteState) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-500">
      {props.label}
      <select
        className={inputClass}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as TelegramNoteState)}
      >
        {(Object.keys(STATE_LABEL) as TelegramNoteState[]).map((state) => (
          <option key={state} value={state}>
            {STATE_LABEL[state]}
          </option>
        ))}
      </select>
    </label>
  )
}

function StatChip(props: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <p className="text-xs text-zinc-500">{props.label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-50">{props.value}</p>
    </div>
  )
}
