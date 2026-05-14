import type { KeywordScore } from '../../domain/analysisTypes'
import { STOPWORDS } from '../stopwords'

/** Частотный топ значимых слов (без стоп-слов). */
export function topKeywords(words: string[], limit: number): KeywordScore[] {
  const counts = new Map<string, number>()
  for (const w of words) {
    if (w.length < 3 || STOPWORDS.has(w)) continue
    counts.set(w, (counts.get(w) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([word, score]) => ({ word, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, limit))
}
