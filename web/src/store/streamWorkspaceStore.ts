import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActiveStructureContext } from '../domain/activeStructureContext'
import type { PromptStructureItem } from '../domain/promptStructure'
import { appendTextToStream } from '../lib/appendStreamTemplate'
import { formatStructureSummaryForChat } from '../lib/promptStructuresFilter'

/** Состояние рабочего места: сырой мастер-текст (тот же источник, что и для файла private). */
interface StreamWorkspaceState {
  masterRawText: string
  setMasterRawText: (value: string) => void
  /** Структура из реестра, с которой пришли с вкладки «Структуры». */
  activeStructure: ActiveStructureContext | null
  clearActiveStructure: () => void
  /** Шаблон структуры в поле текста + контекст для плашки на Потоке. */
  openStructureOnStream: (item: PromptStructureItem) => void
}

export const useStreamWorkspaceStore = create<StreamWorkspaceState>()(
  persist(
    (set) => ({
      masterRawText: '',
      setMasterRawText: (value) => set({ masterRawText: value }),
      activeStructure: null,
      clearActiveStructure: () => set({ activeStructure: null }),
      openStructureOnStream: (item) =>
        set((state) => ({
          activeStructure: {
            id: item.id,
            title: item.title,
            summary: item.summary,
            sourceHint: item.sourceHint,
          },
          masterRawText: appendTextToStream(
            state.masterRawText,
            formatStructureSummaryForChat(item),
          ),
        })),
    }),
    {
      name: 'model-stream-v1',
      partialize: (state) => ({
        masterRawText: state.masterRawText,
        activeStructure: state.activeStructure,
      }),
    },
  ),
)
