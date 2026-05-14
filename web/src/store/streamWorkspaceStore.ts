import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Состояние рабочего места: сырой мастер-текст (тот же источник, что и для файла private). */
interface StreamWorkspaceState {
  masterRawText: string
  setMasterRawText: (value: string) => void
}

export const useStreamWorkspaceStore = create<StreamWorkspaceState>()(
  persist(
    (set) => ({
      masterRawText: '',
      setMasterRawText: (value) => set({ masterRawText: value }),
    }),
    {
      name: 'model-stream-v1',
      partialize: (state) => ({ masterRawText: state.masterRawText }),
    },
  ),
)
