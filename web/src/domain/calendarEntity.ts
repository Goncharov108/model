/** Идентификаторы типов сущностей календаря (расширяемый набор). */
export type CalendarEntityTypeId = 'sadhana' | 'project' | 'family'

/** Статус записи на дату. */
export type CalendarEntityStatus = 'planned' | 'done' | 'skipped' | 'at_risk'

/** Значение одной метрики сущности. */
export type CalendarMetricValue = boolean | number

/** Набор метрик сущности (ключи из конфига типа). */
export type CalendarEntityMetrics = Record<string, CalendarMetricValue>

/** Запись сущности в календаре. */
export interface CalendarEntity {
  id: string
  type: CalendarEntityTypeId
  title: string
  date: string
  status: CalendarEntityStatus
  metrics: CalendarEntityMetrics
}

/** Тип поля метрики для редактора и проверки «слабых мест». */
export type CalendarMetricFieldKind = 'boolean' | 'minutes' | 'scale5' | 'percent'

/** Описание одного поля метрики в конфиге типа. */
export interface CalendarMetricFieldDef {
  key: string
  label: string
  kind: CalendarMetricFieldKind
  /** Порог «слабого» значения для числовых полей. */
  weakBelow?: number
  /** Считать слабым, если boolean = false. */
  weakWhenFalse?: boolean
}

/** Конфиг типа сущности: подписи и схема метрик. */
export interface CalendarEntityTypeDef {
  id: CalendarEntityTypeId
  label: string
  metricFields: CalendarMetricFieldDef[]
  defaultMetrics: () => CalendarEntityMetrics
}

/** Подписи статусов для UI. */
export const CALENDAR_ENTITY_STATUS_LABEL: Record<CalendarEntityStatus, string> = {
  planned: 'Запланировано',
  done: 'Сделано',
  skipped: 'Пропуск',
  at_risk: 'Риск',
}

/** Конфиг типов сущностей — единая точка расширения метрик. */
export const CALENDAR_ENTITY_TYPE_MAP: Record<CalendarEntityTypeId, CalendarEntityTypeDef> = {
  sadhana: {
    id: 'sadhana',
    label: 'Садхана',
    metricFields: [
      { key: 'regularity', label: 'Регулярность', kind: 'boolean', weakWhenFalse: true },
      { key: 'durationMin', label: 'Длительность (мин)', kind: 'minutes', weakBelow: 15 },
      { key: 'quality', label: 'Качество (1–5)', kind: 'scale5', weakBelow: 3 },
    ],
    defaultMetrics: () => ({ regularity: true, durationMin: 30, quality: 3 }),
  },
  project: {
    id: 'project',
    label: 'Проект',
    metricFields: [
      { key: 'focusMin', label: 'Фокус-время (мин)', kind: 'minutes', weakBelow: 30 },
      { key: 'progress', label: 'Прогресс (%)', kind: 'percent', weakBelow: 25 },
      { key: 'impact', label: 'Импакт (1–5)', kind: 'scale5', weakBelow: 3 },
    ],
    defaultMetrics: () => ({ focusMin: 60, progress: 0, impact: 3 }),
  },
  family: {
    id: 'family',
    label: 'Семья',
    metricFields: [
      { key: 'presence', label: 'Присутствие', kind: 'boolean', weakWhenFalse: true },
      { key: 'timeMin', label: 'Время (мин)', kind: 'minutes', weakBelow: 20 },
      { key: 'contactQuality', label: 'Качество контакта (1–5)', kind: 'scale5', weakBelow: 3 },
    ],
    defaultMetrics: () => ({ presence: true, timeMin: 45, contactQuality: 4 }),
  },
}

/** Список типов для селектов UI. */
export const CALENDAR_ENTITY_TYPES = Object.values(CALENDAR_ENTITY_TYPE_MAP)
