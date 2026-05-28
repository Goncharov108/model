import { useEffect, useState } from 'react'
import {
  CALENDAR_ENTITY_STATUS_LABEL,
  CALENDAR_ENTITY_TYPES,
  type CalendarEntity,
  type CalendarEntityStatus,
  type CalendarEntityTypeId,
} from '../../domain/calendarEntity'
import { createEntityDraft } from '../../lib/calendarEntityUtils'
import { AppButton } from '../../ui/AppButton'
import { MetricFieldsEditor } from './MetricFieldsEditor'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30'

/** Форма создания и редактирования сущности календаря. */
export function CalendarEntityForm(props: {
  dateKey: string
  initial?: CalendarEntity | null
  onSave: (draft: Omit<CalendarEntity, 'id'>, id?: string) => void
  onCancel: () => void
}) {
  const { dateKey, initial, onSave, onCancel } = props
  const [type, setType] = useState<CalendarEntityTypeId>(initial?.type ?? 'sadhana')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [status, setStatus] = useState<CalendarEntityStatus>(initial?.status ?? 'planned')
  const [metrics, setMetrics] = useState(initial?.metrics ?? createEntityDraft(dateKey).metrics)

  useEffect(() => {
    if (initial) {
      setType(initial.type)
      setTitle(initial.title)
      setStatus(initial.status)
      setMetrics(initial.metrics)
    } else {
      const draft = createEntityDraft(dateKey, type)
      setTitle('')
      setStatus('planned')
      setMetrics(draft.metrics)
    }
  }, [initial, dateKey])

  const handleTypeChange = (next: CalendarEntityTypeId) => {
    setType(next)
    if (!initial) {
      setMetrics(createEntityDraft(dateKey, next).metrics)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ type, title: title.trim(), date: dateKey, status, metrics }, initial?.id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-sm font-medium text-zinc-200">
        {initial ? 'Редактирование' : 'Новая сущность'}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">Тип</span>
          <select
            className={inputClass}
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as CalendarEntityTypeId)}
          >
            {CALENDAR_ENTITY_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">Статус</span>
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as CalendarEntityStatus)}
          >
            {(Object.keys(CALENDAR_ENTITY_STATUS_LABEL) as CalendarEntityStatus[]).map((s) => (
              <option key={s} value={s}>
                {CALENDAR_ENTITY_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-400">Название</span>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Кратко: что за запись"
        />
      </label>

      <MetricFieldsEditor type={type} metrics={metrics} onChange={setMetrics} />

      <div className="flex flex-wrap gap-2 pt-1">
        <AppButton type="submit">{initial ? 'Сохранить' : 'Добавить'}</AppButton>
        <AppButton type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </AppButton>
      </div>
    </form>
  )
}
