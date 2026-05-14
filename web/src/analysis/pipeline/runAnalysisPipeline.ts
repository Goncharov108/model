import type { LocalAnalysisBundle, TextBlock } from '../../domain/analysisTypes'
import { newId } from '../../lib/newId'
import { computeTextMetrics } from '../metrics/computeTextMetrics'
import { topKeywords } from '../metrics/topKeywords'
import { countWords } from '../text/countWords'
import { normalizeInputText } from '../text/normalizeInputText'
import { splitParagraphChunks } from '../text/splitParagraphChunks'
import { splitSentences } from '../text/splitSentences'
import { tokenizeWords } from '../text/tokenizeWords'

/** Собирает блоки с метриками по абзацам. */
function buildBlocks(normalized: string): TextBlock[] {
  const chunks = splitParagraphChunks(normalized)
  const effective = chunks.length ? chunks : normalized ? [normalized] : []
  return effective.map((text, index) => {
    const sentences = splitSentences(text)
    return {
      id: newId(),
      index,
      text,
      wordCount: countWords(text),
      sentenceCount: sentences.length || (text.trim() ? 1 : 0),
    }
  })
}

/** Единая точка входа локального анализа (тот же конвейер для файла и вставленного текста). */
export function runAnalysisPipeline(rawText: string): LocalAnalysisBundle {
  const normalized = normalizeInputText(rawText)
  const blocks = buildBlocks(normalized)
  const words = tokenizeWords(normalized)
  const metrics = computeTextMetrics(normalized, blocks)
  const keywords = topKeywords(words, 24)

  return {
    kind: 'local',
    generatedAt: new Date().toISOString(),
    metrics,
    blocks,
    keywords,
  }
}
