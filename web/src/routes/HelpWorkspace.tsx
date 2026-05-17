const REPO_OVERVIEW_PATH = 'web/docs/UI_OVERVIEW.md'

/** Краткая справка по приложению; полный текст — в репозитории. */
export function HelpWorkspace() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <h2 className="text-base font-semibold text-zinc-100">Вкладки</h2>
        <ul className="list-disc space-y-2 pl-5 text-zinc-400">
          <li>
            <strong className="font-medium text-zinc-200">Поток</strong> — текст, локальный и
            внешний анализ, экспорт JSON и снимка браузера.
          </li>
          <li>
            <strong className="font-medium text-zinc-200">Структуры из промптов</strong> — реестр
            сидов, поиск, заметки, «Открыть на Потоке».
          </li>
          <li>
            <strong className="font-medium text-zinc-200">План: вопросы</strong> — опросник с
            экспортом ответов в JSON.
          </li>
          <li>
            <strong className="font-medium text-zinc-200">Оркестр</strong> — роли и задачи для
            параллельной работы в IDE (без автозапуска subagent’ов).
          </li>
          <li>
            <strong className="font-medium text-zinc-200">Домен</strong> — прототип слоёв и
            субъектов канона-3 (локально, без OpenFGA).
          </li>
        </ul>

        <h2 className="pt-2 text-base font-semibold text-zinc-100">Первые шаги</h2>
        <ol className="list-decimal space-y-2 pl-5 text-zinc-400">
          <li>На Потоке вставьте текст или загрузите .txt → «Локальный анализ».</li>
          <li>При необходимости импортируйте внешний JSON или кнопки канона в слой.</li>
          <li>На Структурах выберите рамку → «Открыть на Потоке» или скопируйте summary в чат.</li>
          <li>Заполните План и Оркестр → «Снимок браузера» или экспорт JSON для ассистента.</li>
        </ol>

        <h2 className="pt-2 text-base font-semibold text-zinc-100">Приватность</h2>
        <p className="text-zinc-400">
          Содержимое <code className="rounded bg-zinc-900 px-1 text-xs">private/</code> в Git не
          попадает; в снимок браузера оно не подмешивается автоматически. Мастер-текст копируйте в
          поле Потока вручную, если нужен тот же пайплайн.
        </p>

        <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-zinc-400">
          Полный обзор экранов, persist-ключей и JSON: откройте в IDE файл{' '}
          <code className="text-violet-200">{REPO_OVERVIEW_PATH}</code> в корне репозитория model.
        </p>
      </section>
    </div>
  )
}
