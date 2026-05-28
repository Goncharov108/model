import type { CalendarWeakSpot } from '../../lib/calendarEntityUtils'
import { entityTypeLabel, formatDateLabel } from '../../lib/calendarEntityUtils'
import { SurfaceCard } from '../../ui/SurfaceCard'

/** Блок подсветки просадок по метрикам и статусам. */
export function CalendarWeakSpots(props: {
  spots: CalendarWeakSpot[]
  onJumpToDate: (dateKey: string) => void
}) {
  const { spots, onJumpToDate } = props

  return (
    <SurfaceCard
      title="Слабые места"
      description="Просадки по метрикам, пропускам и статусу «риск». Обновляется по всем сохранённым записям."
      className="border-amber-500/20"
    >
      {spots.length === 0 ? (
        <p className="mt-3 text-sm text-emerald-400/90">Сейчас явных просадок нет — ритм держится.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {spots.slice(0, 12).map((spot) => (
            <li
              key={spot.entityId}
              className="rounded-lg border border-amber-500/30 bg-amber-950/25 px-3 py-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-amber-100">
                  {spot.entityTitle}
                  <span className="ml-2 text-xs font-normal text-amber-200/70">
                    {entityTypeLabel(spot.entityType)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => onJumpToDate(spot.date)}
                  className="text-xs text-violet-300 hover:text-violet-200"
                >
                  {formatDateLabel(spot.date)} →
                </button>
              </div>
              <ul className="mt-2 space-y-0.5 text-xs text-amber-100/85">
                {spot.reasons.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {spots.length > 12 ? (
        <p className="mt-3 text-xs text-zinc-500">Показаны первые 12 из {spots.length}.</p>
      ) : null}
    </SurfaceCard>
  )
}
