import { useStreamWorkspaceStore } from '../store/streamWorkspaceStore'

/** Главный экран: импорт и структурирование потока сознания (наполнится после мастер-промпта). */
export function StreamWorkspace() {
  const masterRawText = useStreamWorkspaceStore((s) => s.masterRawText)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3 border-b border-zinc-800 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300/90">
          Локальное рабочее место
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Структурирование потока сознания
        </h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
          Здесь появится интерфейс для глубокого разбора и разложения текста на смысловые
          блоки. Окружение уже готово: после мастер-промпта подключим анализ и визуальные
          представления.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-lg shadow-black/20 backdrop-blur">
          <h2 className="text-sm font-semibold text-zinc-100">Мастер-текст</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Состояние хранится в памяти вкладки (Zustand). Импорт из промпта и персистентность
            настроим на следующем шаге.
          </p>
          <p className="mt-4 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/60 px-3 py-2 font-mono text-xs text-zinc-500">
            символов: {masterRawText.length}
          </p>
        </article>
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-lg shadow-black/20 backdrop-blur">
          <h2 className="text-sm font-semibold text-zinc-100">Кластеры смысла</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Заготовка под автоматическую и ручную группировку фрагментов после анализа.
          </p>
        </article>
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-lg shadow-black/20 backdrop-blur">
          <h2 className="text-sm font-semibold text-zinc-100">Карта / граф</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Заготовка под связи между тезисами (граф, доска, таймлайн — уточним по тексту).
          </p>
        </article>
      </section>

      <section className="flex flex-1 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">Область потока</h2>
          <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-200 ring-1 ring-violet-500/30">
            ожидается мастер-промпт
          </span>
        </div>
        <div className="min-h-[240px] flex-1 rounded-xl border border-dashed border-zinc-700/80 bg-zinc-950/40 p-4 text-left text-sm leading-relaxed text-zinc-500">
          {masterRawText ? (
            <pre className="whitespace-pre-wrap font-sans text-zinc-300">{masterRawText}</pre>
          ) : (
            <p>Пока пусто — вставь поток в следующем сообщении, и мы развернём рабочую схему.</p>
          )}
        </div>
      </section>
    </div>
  )
}
