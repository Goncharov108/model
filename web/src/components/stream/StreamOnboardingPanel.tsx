import { Link } from 'react-router-dom'
import { PATH } from '../../lib/appPaths'
import { useUiPreferencesStore } from '../../store/uiPreferencesStore'
import { AppButton } from '../../ui/AppButton'

const STEPS = [
  {
    title: 'Вставьте текст',
    body: 'Скопируйте поток сознания в поле ниже или загрузите файл .txt. Мастер-текст из private/ сюда не подтягивается автоматически.',
  },
  {
    title: 'Запустите локальный анализ',
    body: 'Кнопка «Локальный анализ» разложит текст на блоки, метрики и ключевые слова — всё в этом браузере.',
  },
  {
    title: 'Передайте результат дальше',
    body: 'Экспорт JSON, «Снимок браузера» для чата Cursor или рамка из «Структур из промптов» на вкладке реестра.',
  },
] as const

/** Онбординг на экране «Поток» (можно скрыть навсегда). */
export function StreamOnboardingPanel(props: {
  hasText: boolean
  hasLocalAnalysis: boolean
  onPickFile: () => void
  onRunLocalAnalysis: () => void
}) {
  const { hasText, hasLocalAnalysis, onPickFile, onRunLocalAnalysis } = props
  const dismissed = useUiPreferencesStore((s) => s.streamOnboardingDismissed)
  const dismiss = useUiPreferencesStore((s) => s.dismissStreamOnboarding)

  if (dismissed) return null

  const stepDone = [hasText, hasLocalAnalysis, hasLocalAnalysis]

  return (
    <section
      className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-950/40 to-zinc-900/50 p-4 sm:p-5"
      aria-label="Быстрый старт на Потоке"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-violet-300/90">
            Быстрый старт
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-50">Как работать с Потоком</h2>
        </div>
        <AppButton type="button" variant="ghost" className="shrink-0 text-xs" onClick={dismiss}>
          Скрыть подсказки
        </AppButton>
      </div>

      <ol className="mt-4 space-y-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className={`flex gap-3 rounded-xl border px-3 py-3 sm:px-4 ${
              stepDone[index]
                ? 'border-emerald-500/30 bg-emerald-950/20'
                : 'border-zinc-800/80 bg-zinc-950/40'
            }`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                stepDone[index] ? 'bg-emerald-600/30 text-emerald-200' : 'bg-zinc-800 text-zinc-400'
              }`}
              aria-hidden
            >
              {stepDone[index] ? '✓' : index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-100">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        <AppButton type="button" variant="ghost" onClick={onPickFile}>
          Загрузить .txt
        </AppButton>
        <AppButton type="button" onClick={onRunLocalAnalysis} disabled={!hasText}>
          Локальный анализ
        </AppButton>
        <Link
          to={PATH.masterAdmin.advanced.structures}
          className="inline-flex min-h-10 items-center rounded-lg border border-zinc-600/90 px-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
        >
          К структурам →
        </Link>
      </div>
    </section>
  )
}
