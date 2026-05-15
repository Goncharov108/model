import type { PromptStructureItem } from '../domain/promptStructure'

/** Нормализует строку для регистронезависимого поиска. */
function norm(value: string): string {
  return value.trim().toLowerCase()
}

/** Проверяет, подходит ли структура под текстовый запрос (заголовок, summary, теги). */
export function matchesStructureSearch(item: PromptStructureItem, query: string): boolean {
  const q = norm(query)
  if (!q) return true
  if (norm(item.title).includes(q)) return true
  if (norm(item.summary).includes(q)) return true
  return item.tags.some((tag) => norm(tag).includes(q))
}

/** Уникальные теги из списка структур, отсортированные по алфавиту. */
export function collectStructureTags(items: PromptStructureItem[]): string[] {
  const set = new Set<string>()
  for (const item of items) {
    for (const tag of item.tags) set.add(tag)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
}

/** Клиентский фильтр реестра: текст + опциональный тег. */
export function filterPromptStructures(
  items: PromptStructureItem[],
  query: string,
  tagFilter: string | null,
): PromptStructureItem[] {
  return items.filter((item) => {
    if (tagFilter && !item.tags.includes(tagFilter)) return false
    return matchesStructureSearch(item, query)
  })
}

/** Текст для вставки в чат Cursor: заголовок, summary и контекст. */
export function formatStructureSummaryForChat(item: PromptStructureItem): string {
  const lines = [
    `## ${item.title}`,
    '',
    item.summary,
    '',
    `Источник: ${item.sourceHint}`,
    `id: ${item.id}`,
  ]
  if (item.tags.length > 0) {
    lines.push(`Теги: ${item.tags.join(', ')}`)
  }
  return lines.join('\n')
}
