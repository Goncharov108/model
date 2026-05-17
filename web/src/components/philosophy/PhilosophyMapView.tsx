import type { JSX } from 'react'
import { useMemo, useState } from 'react'
import { PHILOSOPHY_MAP_META, PHILOSOPHY_VECTORS_SEED } from '../../data/philosophyVectorsSeed'
import type { PhilosophyVectorCategory } from '../../domain/philosophyVector'
import {
  groupPhilosophyVectors,
  PHILOSOPHY_CATEGORY_LABELS,
  philosophyStatusLabel,
} from '../../lib/groupPhilosophyVectors'
import { PhilosophyVectorCard } from './PhilosophyVectorCard'

/** Хаб-карта: центр + лучи по слоям векторов сознания/стратегии. */
function PhilosophyHubDiagram(): JSX.Element {
  const layers = groupPhilosophyVectors(PHILOSOPHY_VECTORS_SEED)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-800/40 bg-gradient-to-b from-amber-950/40 to-zinc-950/80 p-6">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-28 w-28 rounded-full border border-amber-500/30 bg-amber-500/10 blur-sm" />
      </div>
      <div className="relative flex flex-col items-center gap-6">
        <div className="rounded-full border border-amber-500/50 bg-zinc-950/90 px-5 py-3 text-center shadow-lg shadow-amber-950/40">
          <p className="text-xs uppercase tracking-wider text-amber-400/90">Центр</p>
          <p className="mt-1 max-w-xs text-sm font-medium text-zinc-100">
            {PHILOSOPHY_MAP_META.centerLabel}
          </p>
        </div>
        <div className="grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {layers.map((layer) => (
            <div
              key={layer.category}
              className={`rounded-lg border px-2 py-2 text-center text-xs ${layer.accent}`}
            >
              <span className="font-medium text-zinc-200">{layer.label}</span>
              <span className="mt-0.5 block text-[10px] text-zinc-500">{layer.items.length}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Карта векторов: фильтр по слою, раскрываемые карточки, связи. */
export function PhilosophyMapView(): JSX.Element {
  const [filter, setFilter] = useState<PhilosophyVectorCategory | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>('blue-ocean')

  const titleById = useMemo(() => {
    const m = new Map<string, string>()
    for (const v of PHILOSOPHY_VECTORS_SEED) m.set(v.id, v.title)
    return m
  }, [])

  const filtered =
    filter === 'all'
      ? PHILOSOPHY_VECTORS_SEED
      : PHILOSOPHY_VECTORS_SEED.filter((v) => v.category === filter)

  const groups = groupPhilosophyVectors(filtered)

  return (
    <div className="flex flex-col gap-6">
      <PhilosophyHubDiagram />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-zinc-500">Слой:</span>
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Все" />
          {(Object.keys(PHILOSOPHY_CATEGORY_LABELS) as PhilosophyVectorCategory[]).map((cat) => (
            <FilterChip
              key={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
              label={PHILOSOPHY_CATEGORY_LABELS[cat].label}
            />
          ))}
        </div>
        <span className="text-orange-300/80">
          Слой «Жизнь» целиком: вкладка <strong className="font-medium">Жизнь</strong> над картой
        </span>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
        {(['fixed', 'open', 'later'] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                s === 'fixed' ? 'bg-emerald-400' : s === 'open' ? 'bg-amber-400' : 'bg-zinc-500'
              }`}
            />
            {philosophyStatusLabel(s)}
          </span>
        ))}
        <span className="text-zinc-600">· обновлено {PHILOSOPHY_MAP_META.updatedAt}</span>
      </div>

      {groups.map((group) => (
        <section
          key={group.category}
          id={group.category === 'life' ? 'philosophy-layer-life' : undefined}
          className={`scroll-mt-24 space-y-3 ${group.category === 'life' ? 'rounded-xl border border-orange-500/25 bg-orange-950/10 p-4' : ''}`}
        >
          <header className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-zinc-200">{group.label}</h2>
            <span className="text-xs text-zinc-500">{group.hint}</span>
          </header>
          <div className="grid gap-3 md:grid-cols-2">
            {group.items.map((vector) => (
              <PhilosophyVectorCard
                key={vector.id}
                vector={vector}
                expanded={expandedId === vector.id}
                onToggle={() =>
                  setExpandedId((id) => (id === vector.id ? null : vector.id))
                }
                linkedTitles={(vector.linksTo ?? [])
                  .map((id) => titleById.get(id))
                  .filter((t): t is string => Boolean(t))}
              />
            ))}
          </div>
        </section>
      ))}

      <p className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs leading-relaxed text-zinc-500">
        Это <strong className="font-medium text-zinc-400">структурированное понимание</strong>{' '}
        Философа/свода на дату обновления — не твой сырой поток и не полный SWOD. Споришь или
        уточняешь — в чате с Философом; после «фиксируем» — правка сида{' '}
        <code className="text-amber-200/80">philosophyVectorsSeed.ts</code> и деплой.
      </p>
    </div>
  )
}

function FilterChip(props: {
  label: string
  active: boolean
  onClick: () => void
}): JSX.Element {
  const { label, active, onClick } = props
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 transition ${
        active
          ? 'border-amber-500/60 bg-amber-950/50 text-amber-100'
          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
      }`}
    >
      {label}
    </button>
  )
}
