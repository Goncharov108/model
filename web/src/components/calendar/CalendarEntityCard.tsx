import type { CalendarEntity } from '../../domain/calendarEntity'
import { CALENDAR_ENTITY_STATUS_LABEL } from '../../domain/calendarEntity'
import { entityTypeLabel, weakSpotsForEntity } from '../../lib/calendarEntityUtils'
import { AppButton } from '../../ui/AppButton'

/** Карточка сущности выбранного дня. */
export function CalendarEntityCard(props: {
  entity: CalendarEntity
  onEdit: (entity: CalendarEntity) => void
  onDelete: (id: string) => void
}) {
  const { entity, onEdit, onDelete } = props
  const weak = weakSpotsForEntity(entity)
  const hasWeak = weak.length > 0

  return (
    <article
      className={[
        'rounded-xl border p-4 transition',
        hasWeak ? 'border-amber-500/40 bg-amber-950/20' : 'border-zinc-800 bg-zinc-950/40',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-violet-300/90">
            {entityTypeLabel(entity.type)}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-zinc-100">
            {entity.title || 'Без названия'}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {CALENDAR_ENTITY_STATUS_LABEL[entity.status]}
          </p>
        </div>
        <div className="flex gap-2">
          <AppButton variant="ghost" type="button" className="min-h-8 px-2 py-1 text-xs" onClick={() => onEdit(entity)}>
            Изменить
          </AppButton>
          <AppButton
            variant="danger"
            type="button"
            className="min-h-8 px-2 py-1 text-xs"
            onClick={() => onDelete(entity.id)}
          >
            Удалить
          </AppButton>
        </div>
      </div>

      {hasWeak ? (
        <ul className="mt-3 space-y-1 text-xs text-amber-200/90">
          {weak.map((r) => (
            <li key={r}>⚠ {r}</li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
