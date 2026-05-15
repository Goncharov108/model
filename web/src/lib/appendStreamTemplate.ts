const STREAM_TEMPLATE_SEPARATOR = '\n\n---\n\n'

/** Добавляет шаблон в конец поля потока; пустое поле заменяется шаблоном. */
export function appendTextToStream(existing: string, addition: string): string {
  const add = addition.trim()
  if (!add) return existing
  const base = existing.trim()
  if (!base) return add
  return `${base}${STREAM_TEMPLATE_SEPARATOR}${add}`
}
