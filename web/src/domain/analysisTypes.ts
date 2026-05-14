/** Фрагмент исходного текста (блок абзацев). */
export interface TextBlock {
  id: string
  index: number
  text: string
  wordCount: number
  sentenceCount: number
}

/** Базовые метрики потока. */
export interface TextMetrics {
  characters: number
  words: number
  paragraphs: number
  sentences: number
  avgWordsPerSentence: number
  lexicalDiversity: number
}

/** Ключевое слово с весом. */
export interface KeywordScore {
  word: string
  score: number
}

/** Результат локального конвейера анализа. */
export interface LocalAnalysisBundle {
  kind: 'local'
  generatedAt: string
  metrics: TextMetrics
  blocks: TextBlock[]
  keywords: KeywordScore[]
}

/** Внешний «глубокий» анализ (модель/агент), импортируется JSON-ом. */
export interface ExternalAnalysisV1 {
  version: 1
  generatedAt: string
  modelHint?: string
  summary: string
  themes: Array<{
    id: string
    title: string
    rationale: string
    relatedBlockIndices?: number[]
  }>
  tensions: string[]
  hypotheses: string[]
}

export type AnalysisImportError = { ok: false; message: string }
export type AnalysisImportOk = { ok: true; value: ExternalAnalysisV1 }
export type AnalysisImportResult = AnalysisImportError | AnalysisImportOk
