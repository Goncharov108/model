import { useMemo, useState } from 'react'
import type { TelegramNoteGroup, TelegramNotePriority, TelegramNoteState } from '../domain/telegramNotes'
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

/** Входящий поток: импорт и разбор заметок из Telegram export JSON. */
export function MasterAdminIncomingWorkspace() {
  const snapshot = useTelegramNotesStore((s) => s.snapshot)
  const setSnapshot = useTelegramNotesStore((s) => s.setSnapshot)
  const setItemState = useTelegramNotesStore((s) => s.setItemState)
  const clear = useTelegramNotesStore((s) => s.clear)

  const [groupFilter, setGroupFilter] = useState<TelegramNoteGroup | 'all'>('all')
  const [stateFilter, setStateFilter] = useState<TelegramNoteState | 'all'>('all')
  const [query, setQuery] = useState('')
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

  const filteredItems = useMemo(() => {
    const base = snapshot?.items ?? []
    return base.filter((item) => {
      if (groupFilter !== 'all' && item.group !== groupFilter) return false
      if (stateFilter !== 'all' && item.state !== stateFilter) return false
      if (!query.trim()) return true
      const haystack = `${item.text} ${item.links.join(' ')} ${item.tags.join(' ')}`.toLowerCase()
      return haystack.includes(query.toLowerCase())
    })
  }, [groupFilter, query, snapshot, stateFilter])

  async function handleImport(file: File) {
    setBusy(true)
    setError(null)
    try {
      const text = await readTextFile(file)
      const parsed = parseTelegramNotesExport(text, file.name)
      setSnapshot(parsed)
      setGroupFilter('all')
      setStateFilter('all')
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
        description="Загрузите JSON-экспорт Telegram: заметки автоматически очищаются от дублей, получают теги и приоритет."
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

      <SurfaceCard title="Фильтр и поиск">
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Группа
            <select
              className={inputClass}
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value as TelegramNoteGroup | 'all')}
            >
              <option value="all">Все</option>
              {(Object.keys(GROUP_LABEL) as TelegramNoteGroup[]).map((group) => (
                <option key={group} value={group}>
                  {GROUP_LABEL[group]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Статус
            <select
              className={inputClass}
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value as TelegramNoteState | 'all')}
            >
              <option value="all">Все</option>
              {(Object.keys(STATE_LABEL) as TelegramNoteState[]).map((state) => (
                <option key={state} value={state}>
                  {STATE_LABEL[state]}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0 flex-1 flex flex-col gap-1 text-xs text-zinc-500">
            Поиск
            <input
              className={inputClass}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Искать по тексту, ссылкам и тегам…"
            />
          </label>
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
              <article key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">{GROUP_LABEL[item.group]}</span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">{PRIORITY_LABEL[item.priority]}</span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">{STATE_LABEL[item.state]}</span>
                  <span>{new Date(item.dateIso).toLocaleString('ru-RU')}</span>
                </div>
                {item.text ? <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-100">{item.text}</p> : null}

                {item.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={`${item.id}-${tag}`} className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {item.links.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-violet-300">
                    {item.links.map((link) => (
                      <li key={`${item.id}-${link}`}>
                        <a href={link} target="_blank" rel="noreferrer" className="hover:underline">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {(item.hasPhoto || item.hasFile) && !item.text ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    {item.hasPhoto ? 'Содержит фото' : ''}
                    {item.hasPhoto && item.hasFile ? ' · ' : ''}
                    {item.hasFile ? 'Содержит файл' : ''}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <AppButton type="button" variant="ghost" onClick={() => setItemState(item.id, 'in_work')}>
                    В работу
                  </AppButton>
                  <AppButton type="button" variant="ghost" onClick={() => setItemState(item.id, 'archived')}>
                    В архив
                  </AppButton>
                  <AppButton type="button" variant="ghost" onClick={() => setItemState(item.id, 'inbox')}>
                    Во входящие
                  </AppButton>
                </div>
              </article>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
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
