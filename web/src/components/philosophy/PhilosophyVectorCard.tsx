import type { JSX } from 'react'
import type { PhilosophyVector } from '../../domain/philosophyVector'
import {
  PHILOSOPHY_CATEGORY_LABELS,
  philosophyStatusLabel,
} from '../../lib/groupPhilosophyVectors'

const STATUS_DOT: Record<PhilosophyVector['status'], string> = {
  fixed: 'bg-emerald-400',
  open: 'bg-amber-400',
  later: 'bg-zinc-500',
}

/** Карточка одного вектора на карте философии. */
export function PhilosophyVectorCard(props: {
  vector: PhilosophyVector
  linkedTitles: string[]
  expanded: boolean
  onToggle: () => void
}): JSX.Element {
  const { vector, linkedTitles, expanded, onToggle } = props
  const accent = PHILOSOPHY_CATEGORY_LABELS[vector.category].accent

  return (
    <article
      className={`rounded-xl border p-4 transition ${accent} ${expanded ? 'ring-1 ring-amber-500/40' : ''}`}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 text-left"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[vector.status]}`}
          title={philosophyStatusLabel(vector.status)}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-zinc-100">{vector.title}</span>
          <span className="mt-1 block text-sm leading-snug text-zinc-400">{vector.essence}</span>
        </span>
        <span className="shrink-0 text-xs text-zinc-500">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded ? (
        <div className="mt-3 space-y-3 border-t border-zinc-800/80 pt-3 pl-5">
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-zinc-300">
            {vector.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          {vector.lawRef ? (
            <p className="text-xs text-zinc-500">
              Опора: <span className="text-amber-200/80">{vector.lawRef}</span>
            </p>
          ) : null}
          {linkedTitles.length > 0 ? (
            <p className="text-xs text-zinc-500">
              Связи:{' '}
              <span className="text-zinc-400">{linkedTitles.join(' · ')}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
