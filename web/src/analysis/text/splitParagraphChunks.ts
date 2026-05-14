/** Делит текст на блоки по пустым строкам (абзацы / смысловые куски). */
export function splitParagraphChunks(text: string): string[] {
  if (!text) return []
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}
