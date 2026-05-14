import type {
  AnalysisImportResult,
  ExternalAnalysisV1,
} from '../../domain/analysisTypes'

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function parseThemes(raw: unknown): ExternalAnalysisV1['themes'] | null {
  if (!Array.isArray(raw)) return null
  const themes: ExternalAnalysisV1['themes'] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null
    const o = item as Record<string, unknown>
    if (!isNonEmptyString(o.id) || !isNonEmptyString(o.title) || !isNonEmptyString(o.rationale)) {
      return null
    }
    const related =
      Array.isArray(o.relatedBlockIndices) &&
      o.relatedBlockIndices.every((n) => typeof n === 'number' && Number.isFinite(n))
        ? (o.relatedBlockIndices as number[])
        : undefined
    themes.push({
      id: o.id.trim(),
      title: o.title.trim(),
      rationale: o.rationale.trim(),
      relatedBlockIndices: related,
    })
  }
  return themes
}

/** Разбирает JSON внешнего глубокого анализа (модель/агент). */
export function parseExternalAnalysisJson(jsonText: string): AnalysisImportResult {
  let data: unknown
  try {
    data = JSON.parse(jsonText) as unknown
  } catch {
    return { ok: false, message: 'Невалидный JSON' }
  }
  if (!data || typeof data !== 'object') {
    return { ok: false, message: 'Корень JSON должен быть объектом' }
  }
  const root = data as Record<string, unknown>
  if (root.version !== 1) {
    return { ok: false, message: 'Ожидается version: 1' }
  }
  if (!isNonEmptyString(root.generatedAt) || !isNonEmptyString(root.summary)) {
    return { ok: false, message: 'Поля generatedAt и summary обязательны' }
  }
  const themes = parseThemes(root.themes)
  if (!themes) return { ok: false, message: 'Поле themes — массив объектов {id,title,rationale}' }

  const tensions = Array.isArray(root.tensions)
    ? root.tensions.filter(isNonEmptyString)
    : []
  const hypotheses = Array.isArray(root.hypotheses)
    ? root.hypotheses.filter(isNonEmptyString)
    : []

  const value: ExternalAnalysisV1 = {
    version: 1,
    generatedAt: root.generatedAt.trim(),
    modelHint: isNonEmptyString(root.modelHint) ? root.modelHint.trim() : undefined,
    summary: root.summary.trim(),
    themes,
    tensions,
    hypotheses,
  }
  return { ok: true, value }
}
