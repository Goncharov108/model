import type { TextBlock, TextMetrics } from '../../domain/analysisTypes'
import { splitSentences } from '../text/splitSentences'
import { tokenizeWords } from '../text/tokenizeWords'

/** Сводные метрики по нормализованному тексту и блокам. */
export function computeTextMetrics(normalizedText: string, blocks: TextBlock[]): TextMetrics {
  const wordsArr = tokenizeWords(normalizedText)
  const unique = new Set(wordsArr)
  const sentences = splitSentences(normalizedText)
  const sentenceCount = sentences.length || (normalizedText.trim() ? 1 : 0)
  const avgWordsPerSentence = sentenceCount ? wordsArr.length / sentenceCount : 0
  const lexicalDiversity = wordsArr.length ? unique.size / wordsArr.length : 0

  return {
    characters: normalizedText.length,
    words: wordsArr.length,
    paragraphs: blocks.length || (normalizedText.trim() ? 1 : 0),
    sentences: sentenceCount,
    avgWordsPerSentence,
    lexicalDiversity,
  }
}
