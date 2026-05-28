import type { CalendarEntityTypeId, CalendarMetricFieldDef } from '../../domain/calendarEntity'
import { CALENDAR_ENTITY_TYPE_MAP } from '../../domain/calendarEntity'
import type { CalendarEntityMetrics } from '../../domain/calendarEntity'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30'

/** Редактор полей метрик по конфигу типа сущности. */
export function MetricFieldsEditor(props: {
  type: CalendarEntityTypeId
  metrics: CalendarEntityMetrics
  onChange: (metrics: CalendarEntityMetrics) => void
}) {
  const { type, metrics, onChange } = props
  const fields = CALENDAR_ENTITY_TYPE_MAP[type].metricFields

  const setField = (field: CalendarMetricFieldDef, raw: string | boolean) => {
    let value: boolean | number
    if (field.kind === 'boolean') {
      value = Boolean(raw)
    } else {
      value = Number(raw)
      if (Number.isNaN(value)) return
    }
    onChange({ ...metrics, [field.key]: value })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <label key={field.key} className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">{field.label}</span>
          {field.kind === 'boolean' ? (
            <select
              className={inputClass}
              value={metrics[field.key] === false ? 'no' : 'yes'}
              onChange={(e) => setField(field, e.target.value === 'yes')}
            >
              <option value="yes">Да</option>
              <option value="no">Нет</option>
            </select>
          ) : field.kind === 'scale5' ? (
            <input
              type="number"
              min={1}
              max={5}
              step={1}
              className={inputClass}
              value={Number(metrics[field.key] ?? 3)}
              onChange={(e) => setField(field, e.target.value)}
            />
          ) : field.kind === 'percent' ? (
            <input
              type="number"
              min={0}
              max={100}
              step={5}
              className={inputClass}
              value={Number(metrics[field.key] ?? 0)}
              onChange={(e) => setField(field, e.target.value)}
            />
          ) : (
            <input
              type="number"
              min={0}
              step={5}
              className={inputClass}
              value={Number(metrics[field.key] ?? 0)}
              onChange={(e) => setField(field, e.target.value)}
            />
          )}
        </label>
      ))}
    </div>
  )
}
