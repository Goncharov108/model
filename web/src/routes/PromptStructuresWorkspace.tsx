import { useMemo, useState } from 'react'
import { usePromptStructuresStore } from '../store/promptStructuresStore'

/** Вкладка: реестр и разбор структур, явно выделенных в промптах. */
export function PromptStructuresWorkspace() {
  const items = usePromptStructuresStore((s) => s.items)
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso)),
    [items],
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3 border-b border-zinc-800 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300/90">
          Реестр из промптов
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Структуры из промптов
        </h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
          Здесь копятся подтверждённые тобой сущности и правила из диалога. Дальше добавим
          разбор, связи с потоком сознания и заметки по каждой позиции.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {sorted.map((item) => {
          const open = openId === item.id
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
                </div>
                <span className="shrink-0 rounded-md bg-zinc-950/60 px-2 py-1 text-xs text-zinc-500">
                  {open ? '−' : '+'}
                </span>
              </button>
              {open ? (
                <div className="border-t border-zinc-800 px-5 py-4 text-sm text-zinc-400">
                  <p>
                    <span className="font-medium text-zinc-300">Источник: </span>
                    {item.sourceHint}
                  </p>
                  <p className="mt-2">
                    <span className="font-medium text-zinc-300">id: </span>
                    <code className="rounded bg-zinc-950 px-1.5 py-0.5 text-xs text-zinc-500">
                      {item.id}
                    </code>
                    <span className="mx-2 text-zinc-600">·</span>
                    <span className="font-medium text-zinc-300">создано: </span>
                    {item.createdAtIso}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-200 ring-1 ring-violet-500/25"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
