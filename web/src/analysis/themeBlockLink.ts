import type { ExternalAnalysisV1 } from '../domain/analysisTypes'

type Theme = ExternalAnalysisV1['themes'][number]

/** Возвращает индексы блоков локального анализа, на которые ссылается тема (с фильтром по длине). */
export function resolveThemeBlockIndices(theme: Theme, blockCount: number): number[] {
  if (!theme.relatedBlockIndices?.length) return []
  return theme.relatedBlockIndices.filter((i) => Number.isInteger(i) && i >= 0 && i < blockCount)
}
