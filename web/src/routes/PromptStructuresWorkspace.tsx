import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATH } from '../lib/appPaths'
import {
  collectStructureTags,
  filterPromptStructures,
  formatStructureSummaryForChat,
} from '../lib/promptStructuresFilter'
import { copyToClipboard } from '../lib/copyToClipboard'
import { usePromptStructuresStore } from '../store/promptStructuresStore'
import { useStreamWorkspaceStore } from '../store/streamWorkspaceStore'
import { useStructureNotesStore } from '../store/structureNotesStore'
import type { PromptStructureItem } from '../domain/promptStructure'
import { AppButton } from '../ui/AppButton'
import { PageHeader } from '../ui/PageHeader'

type CopyFeedback = { id: string; kind: 'id' | 'summary' } | null

/** Вкладка: реестр структур из промптов с поиском, заметками и копированием в чат. */
export function PromptStructuresWorkspace() {
  const navigate = useNavigate()
  const items = usePromptStructuresStore((s) => s.items)
  const notesById = useStructureNotesStore((s) => s.notesById)
  const setNote = useStructureNotesStore((s) => s.setNote)
  const openStructureOnStream = useStreamWorkspaceStore((s) => s.openStructureOnStream)

  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)
  const [query, setQuery] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>(null)

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso)),
    [items],
  )

  const allTags = useMemo(() => collectStructureTags(sorted), [sorted])

  const filtered = useMemo(
    () => filterPromptStructures(sorted, query, tagFilter),
    [sorted, query, tagFilter],
  )

  const hasActiveFilter = query.trim().length > 0 || tagFilter !== null

  async function onCopy(item: PromptStructureItem, kind: 'id' | 'summary') {
    const text = kind === 'id' ? item.id : formatStructureSummaryForChat(item)
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopyFeedback({ id: item.id, kind })
      window.setTimeout(() => setCopyFeedback(null), 2000)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Реестр из промптов"
        title="Структуры из промптов"
        description="Опорные каркасы из подтверждённых промптов: поиск по реестру, заметки только в этом браузере, копирование формулировок в чат Cursor. Сиды в коде не редактируются здесь."
      />

      <section
        className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-5"
        aria-label="Поиск и фильтр"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Поиск
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Заголовок, краткое описание или тег…"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </label>

        {allTags.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Тег
            </span>
            <div className="flex flex-wrap gap-2">
              <TagFilterChip
                active={tagFilter === null}
                label="Все"
                onClick={() => setTagFilter(null)}
              />
              {allTags.map((tag) => (
                <TagFilterChip
                  key={tag}
                  active={tagFilter === tag}
                  label={tag}
                  onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                />
              ))}
            </div>
          </div>
        ) : null}

        <p className="text-xs text-zinc-500">
          Найдено: {filtered.length} из {sorted.length}
          {hasActiveFilter ? (
            <button
              type="button"
              className="ml-2 text-violet-300 underline-offset-2 hover:underline"
              onClick={() => {
                setQuery('')
                setTagFilter(null)
              }}
            >
              Сбросить фильтр
            </button>
          ) : null}
        </p>
      </section>

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20 px-6 py-12 text-center"
          role="status"
        >
          <p className="text-base font-medium text-zinc-200">Ничего не найдено</p>
          <p className="mt-2 text-sm text-zinc-500">
            {hasActiveFilter
              ? 'Измените запрос или снимите фильтр по тегу.'
              : 'В реестре пока нет структур.'}
          </p>
          {hasActiveFilter ? (
            <AppButton
              variant="ghost"
              className="mt-6"
              onClick={() => {
                setQuery('')
                setTagFilter(null)
              }}
            >
              Сбросить фильтр
            </AppButton>
          ) : null}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((item) => {
            const open = openId === item.id
            const note = notesById[item.id] ?? ''
            const copiedId = copyFeedback?.id === item.id && copyFeedback.kind === 'id'
            const copiedSummary =
              copyFeedback?.id === item.id && copyFeedback.kind === 'summary'

            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-lg shadow-black/20 backdrop-blur"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-zinc-800/40"
                >
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold text-zinc-100">{item.title}</h2>
                    <p className="text-sm text-zinc-400">{item.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-200 ring-1 ring-violet-500/25"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-zinc-950/60 px-2 py-1 text-xs text-zinc-500">
                    {open ? '−' : '+'}
                  </span>
                </button>
                {open ? (
                  <div className="space-y-4 border-t border-zinc-800 px-5 py-4 text-sm text-zinc-400">
                    <p>
                      <span className="font-medium text-zinc-300">Источник: </span>
                      {item.sourceHint}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-300">id: </span>
                      <code className="rounded bg-zinc-950 px-1.5 py-0.5 text-xs text-zinc-500">
                        {item.id}
                      </code>
                      <span className="mx-2 text-zinc-600">·</span>
                      <span className="font-medium text-zinc-300">создано: </span>
                      {item.createdAtIso}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <AppButton
                        type="button"
                        onClick={() => {
                          openStructureOnStream(item)
                          void navigate(PATH.masterAdmin.advanced.stream)
                        }}
                      >
                        Открыть на Потоке
                      </AppButton>
                      <AppButton
                        variant="ghost"
                        onClick={() => void onCopy(item, 'id')}
                        aria-live="polite"
                      >
                        {copiedId ? 'Id скопирован' : 'Скопировать id'}
                      </AppButton>
                      <AppButton
                        variant="ghost"
                        onClick={() => void onCopy(item, 'summary')}
                        aria-live="polite"
                      >
                        {copiedSummary ? 'Скопировано' : 'Скопировать summary для чата'}
                      </AppButton>
                    </div>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Заметка владельца
                      </span>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(item.id, e.target.value)}
                        rows={3}
                        placeholder="Связи с потоком, уточнения для агента…"
                        className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      />
                      <span className="text-xs text-zinc-600">
                        Хранится локально (model-structure-notes-v1), не в Git.
                      </span>
                    </label>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Кнопка-чип фильтра по тегу. */
function TagFilterChip(props: { active: boolean; label: string; onClick: () => void }) {
  const { active, label, onClick } = props
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? 'bg-violet-600 text-white ring-1 ring-violet-400/50'
          : 'bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-600/80 hover:bg-zinc-700/80'
      }`}
    >
      {label}
    </button>
  )
}
