import { useEffect, useMemo, useState } from 'react'
import type {
  TelegramNoteFolder,
  TelegramNoteGroup,
  TelegramNotePriority,
  TelegramNoteState,
  TelegramRoutingRuleSet,
} from '../domain/telegramNotes'
import { readTextFile } from '../lib/readTextFile'
import { countByGroup, parseTelegramNotesExport } from '../lib/telegramNotes'
import { useTelegramNotesStore } from '../store/telegramNotesStore'
import { AppButton } from '../ui/AppButton'
import { PageHeader } from '../ui/PageHeader'
import { SurfaceCard } from '../ui/SurfaceCard'

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

export function MasterAdminIncomingWorkspace() {
  const snapshot = useTelegramNotesStore((s) => s.snapshot)
  const setSnapshot = useTelegramNotesStore((s) => s.setSnapshot)
  const selectedIds = useTelegramNotesStore((s) => s.selectedIds)
  const routingPresets = useTelegramNotesStore((s) => s.routingPresets)
  const activePresetId = useTelegramNotesStore((s) => s.activePresetId)
  const setActivePreset = useTelegramNotesStore((s) => s.setActivePreset)
  const updateActivePreset = useTelegramNotesStore((s) => s.updateActivePreset)
  const createPreset = useTelegramNotesStore((s) => s.createPreset)
  const duplicateActivePreset = useTelegramNotesStore((s) => s.duplicateActivePreset)
  const renameActivePreset = useTelegramNotesStore((s) => s.renameActivePreset)
  const deleteActivePreset = useTelegramNotesStore((s) => s.deleteActivePreset)
  const applyQuickMode = useTelegramNotesStore((s) => s.applyQuickMode)
  const setItemState = useTelegramNotesStore((s) => s.setItemState)
  const setItemFolder = useTelegramNotesStore((s) => s.setItemFolder)
  const applyStateToSelected = useTelegramNotesStore((s) => s.applyStateToSelected)
  const applyFolderToSelected = useTelegramNotesStore((s) => s.applyFolderToSelected)
  const toggleSelected = useTelegramNotesStore((s) => s.toggleSelected)
  const clearSelection = useTelegramNotesStore((s) => s.clearSelection)
  const selectAll = useTelegramNotesStore((s) => s.selectAll)
  const applyAutoRouting = useTelegramNotesStore((s) => s.applyAutoRouting)
  const clear = useTelegramNotesStore((s) => s.clear)

  const [groupFilter, setGroupFilter] = useState<TelegramNoteGroup | 'all'>('all')
  const [stateFilter, setStateFilter] = useState<TelegramNoteState | 'all'>('all')
  const [folderFilter, setFolderFilter] = useState<TelegramNoteFolder | 'all'>('all')
  const [query, setQuery] = useState('')
  const [presetName, setPresetName] = useState('')
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

  const filteredItems = useMemo(() => {
    const base = snapshot?.items ?? []
    return base.filter((item) => {
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
              <AppButton type="button" variant="ghost" onClick={() => deleteActivePreset()} disabled={isActivePresetLocked}>Удалить</AppButton>
            </div>

            <div>
              <AppButton type="button" variant="ghost" onClick={() => createPreset(presetName || 'Новый пресет')}>
                Создать новый пресет
              </AppButton>
            </div>

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
