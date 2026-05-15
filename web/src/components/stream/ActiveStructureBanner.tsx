import { Link } from 'react-router-dom'
import { PATH } from '../../lib/appPaths'
import type { ActiveStructureContext } from '../../domain/activeStructureContext'
import { AppButton } from '../../ui/AppButton'

/** Плашка: на Потоке активна структура из реестра (можно сбросить). */
export function ActiveStructureBanner(props: {
  structure: ActiveStructureContext
  onDismiss: () => void
}) {
  const { structure, onDismiss } = props

  return (
    <aside
      className="rounded-2xl border border-violet-500/30 bg-violet-950/25 px-4 py-4 sm:px-5"
      aria-label="Активная структура из реестра"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-300/90">
            Активная структура из реестра
          </p>
          <p className="text-base font-semibold text-zinc-100">{structure.title}</p>
          <p className="text-sm leading-relaxed text-zinc-400">{structure.summary}</p>
          <p className="text-xs text-zinc-500">
            <span className="text-zinc-400">Источник:</span> {structure.sourceHint}
            <span className="mx-2 text-zinc-600">·</span>
            <code className="rounded bg-zinc-950/80 px-1 py-0.5 text-[10px] text-zinc-500">
              {structure.id}
            </code>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <AppButton variant="ghost" type="button" onClick={onDismiss}>
            Сбросить
          </AppButton>
          <Link
            to={PATH.masterAdmin.advanced.structures}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-zinc-600/90 bg-zinc-900/90 px-3 py-2 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800"
          >
            К структурам
          </Link>
        </div>
      </div>
    </aside>
  )
}
