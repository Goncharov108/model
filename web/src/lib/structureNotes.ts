/** Слияние словарей заметок: значения из patch перекрывают base по id структуры. */
export function mergeStructureNotes(
  base: Record<string, string>,
  patch: Record<string, string>,
): Record<string, string> {
  return { ...base, ...patch }
}

/** Удаляет пустые заметки после правки текста. */
export function pruneEmptyStructureNotes(notes: Record<string, string>): Record<string, string> {
  const next: Record<string, string> = {}
  for (const [id, text] of Object.entries(notes)) {
    if (text.trim()) next[id] = text
  }
  return next
}
