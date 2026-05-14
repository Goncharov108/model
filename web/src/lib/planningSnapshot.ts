import type { PlanAnswerValue } from '../domain/planningQuestion'

const EXPORT_VERSION = 1 as const

export type PlanningExportEnvelope = {
  version: typeof EXPORT_VERSION
  exportedAt: string
  answers: Record<string, PlanAnswerValue>
}

function isPlanAnswerValue(v: unknown): v is PlanAnswerValue {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (!('optionId' in o)) return false
  const opt = o.optionId
  if (opt !== null && typeof opt !== 'string') return false
  if ('customText' in o && typeof o.customText !== 'string') return false
  return true
}

/** Собирает JSON-конверт для выгрузки ответов опросника. */
export function buildPlanningExport(answers: Record<string, PlanAnswerValue>): PlanningExportEnvelope {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    answers: { ...answers },
  }
}

export type PlanningImportResult =
  | { ok: true; answers: Record<string, PlanAnswerValue> }
  | { ok: false; message: string }

/** Разбирает JSON импорта ответов опросника (версия 1). */
export function parsePlanningImport(jsonText: string): PlanningImportResult {
  let data: unknown
  try {
    data = JSON.parse(jsonText) as unknown
  } catch {
    return { ok: false, message: 'Невалидный JSON' }
  }
  if (!data || typeof data !== 'object') return { ok: false, message: 'Ожидается объект' }
  const root = data as Record<string, unknown>
  if (root.version !== EXPORT_VERSION) return { ok: false, message: 'Ожидается version: 1' }
  if (!root.answers || typeof root.answers !== 'object') {
    return { ok: false, message: 'Поле answers обязательно' }
  }
  const rawAnswers = root.answers as Record<string, unknown>
  const answers: Record<string, PlanAnswerValue> = {}
  for (const [key, val] of Object.entries(rawAnswers)) {
    if (!isPlanAnswerValue(val)) {
      return { ok: false, message: `Некорректный ответ для ключа "${key}"` }
    }
    answers[key] = {
      optionId: val.optionId,
      customText: typeof val.customText === 'string' ? val.customText : '',
    }
  }
  return { ok: true, answers }
}
