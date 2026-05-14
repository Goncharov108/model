import { create } from 'zustand'
import { DEFAULT_PROMPT_STRUCTURES } from '../data/promptStructureSeeds'
import type { PromptStructureItem } from '../domain/promptStructure'
import { newId } from '../lib/newId'

export type { PromptStructureItem } from '../domain/promptStructure'

interface PromptStructuresState {
  items: PromptStructureItem[]
  /** Добавить структуру из нового подтверждённого промпта. */
  addItem: (
    item: Omit<PromptStructureItem, 'createdAtIso'> &
      Partial<Pick<PromptStructureItem, 'id' | 'createdAtIso'>>,
  ) => void
}

export const usePromptStructuresStore = create<PromptStructuresState>((set) => ({
  items: DEFAULT_PROMPT_STRUCTURES,
  addItem: (partial) =>
    set((state) => {
      const row: PromptStructureItem = {
        id: partial.id ?? newId(),
        title: partial.title,
        summary: partial.summary,
        tags: partial.tags,
        sourceHint: partial.sourceHint,
        createdAtIso: partial.createdAtIso ?? new Date().toISOString(),
      }
      const withoutDup = state.items.filter((x) => x.id !== row.id)
      return { items: [...withoutDup, row] }
    }),
}))
