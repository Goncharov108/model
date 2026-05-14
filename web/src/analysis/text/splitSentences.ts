/** Грубое разбиение на предложения (достаточно для потока сознания и метрик). */
export function splitSentences(text: string): string[] {
  if (!text.trim()) return []
  const parts = text.split(/(?<=[.!?…])\s+/u)
  return parts.map((s) => s.trim()).filter(Boolean)
}
