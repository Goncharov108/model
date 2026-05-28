import {
  CALENDAR_ENTITY_STATUS_LABEL,
  CALENDAR_ENTITY_TYPE_MAP,
  type CalendarEntity,
  type CalendarEntityMetrics,
  type CalendarEntityStatus,
  type CalendarEntityTypeId,
  type CalendarMetricFieldDef,
  type CalendarMetricValue,
} from '../domain/calendarEntity'

/** Локальный ключ даты YYYY-MM-DD без сдвига UTC. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Разбор ключа даты в локальный Date (полдень, чтобы избежать DST). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

/** Сегодня как ключ даты. */
export function todayDateKey(): string {
  return toDateKey(new Date())
}

/** Первый день месяца для ключа YYYY-MM. */
export function monthStart(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex, 1, 12, 0, 0, 0)
}

/** Число дней в месяце. */
export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

/** День недели понедельник=0 … воскресенье=6. */
export function weekdayMon0(date: Date): number {
  return (date.getDay() + 6) % 7
}

/** Подпись месяца для шапки календаря. */
export function formatMonthYear(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })
}

/** Короткая подпись дня для списка. */
export function formatDateLabel(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })
}

/** Метрики по умолчанию для типа. */
export function defaultMetricsForType(type: CalendarEntityTypeId): CalendarEntityMetrics {
  return { ...CALENDAR_ENTITY_TYPE_MAP[type].defaultMetrics() }
}

/** Новый id записи. */
export function newCalendarEntityId(): string {
  return `ce-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Черновик новой сущности на дату. */
export function createEntityDraft(
  date: string,
  type: CalendarEntityTypeId = 'sadhana',
): Omit<CalendarEntity, 'id'> {
  return {
    type,
    title: '',
    date,
    status: 'planned',
    metrics: defaultMetricsForType(type),
  }
}

export interface CalendarWeakSpot {
  entityId: string
  entityTitle: string
  entityType: CalendarEntityTypeId
  date: string
  reasons: string[]
}

/** Проверка одного поля метрики на «слабость». */
function metricWeakReason(field: CalendarMetricFieldDef, value: CalendarMetricValue | undefined): string | null {
  if (value === undefined) return `${field.label}: нет значения`

  if (field.kind === 'boolean' && field.weakWhenFalse && value === false) {
    return `${field.label}: нет`
  }

  if (typeof value === 'number' && field.weakBelow !== undefined && value < field.weakBelow) {
    return `${field.label}: ниже порога (${value})`
  }

  return null
}

/** Слабые места по одной сущности. */
export function weakSpotsForEntity(entity: CalendarEntity): string[] {
  const typeDef = CALENDAR_ENTITY_TYPE_MAP[entity.type]
  const reasons: string[] = []

  if (entity.status === 'skipped') {
    reasons.push(`Статус: ${CALENDAR_ENTITY_STATUS_LABEL.skipped}`)
  }
  if (entity.status === 'at_risk') {
    reasons.push(`Статус: ${CALENDAR_ENTITY_STATUS_LABEL.at_risk}`)
  }

  for (const field of typeDef.metricFields) {
    const reason = metricWeakReason(field, entity.metrics[field.key])
    if (reason) reasons.push(reason)
  }

  return reasons
}

/** Все слабые места по списку сущностей (сначала свежие даты). */
export function collectWeakSpots(entities: CalendarEntity[]): CalendarWeakSpot[] {
  return [...entities]
    .sort((a, b) => b.date.localeCompare(a.date))
    .flatMap((entity) => {
      const reasons = weakSpotsForEntity(entity)
      if (reasons.length === 0) return []
      return [
        {
          entityId: entity.id,
          entityTitle: entity.title || CALENDAR_ENTITY_TYPE_MAP[entity.type].label,
          entityType: entity.type,
          date: entity.date,
          reasons,
        },
      ]
    })
}

/** Сущности на конкретную дату. */
export function entitiesOnDate(entities: CalendarEntity[], dateKey: string): CalendarEntity[] {
  return entities.filter((e) => e.date === dateKey)
}

/** Количество сущностей по датам месяца. */
export function countEntitiesByDate(entities: CalendarEntity[], year: number, monthIndex: number): Map<string, number> {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`
  const map = new Map<string, number>()
  for (const entity of entities) {
    if (!entity.date.startsWith(prefix)) continue
    map.set(entity.date, (map.get(entity.date) ?? 0) + 1)
  }
  return map
}

/** Подпись типа сущности. */
export function entityTypeLabel(type: CalendarEntityTypeId): string {
  return CALENDAR_ENTITY_TYPE_MAP[type].label
}

/** Подпись статуса. */
export function entityStatusLabel(status: CalendarEntityStatus): string {
  return CALENDAR_ENTITY_STATUS_LABEL[status]
}
