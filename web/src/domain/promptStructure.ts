/** Элемент реестра: структура или требование, извлечённые из промпта пользователя. */
export interface PromptStructureItem {
  id: string
  title: string
  summary: string
  tags: string[]
  sourceHint: string
  createdAtIso: string
}
