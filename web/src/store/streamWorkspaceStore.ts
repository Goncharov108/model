import { create } from 'zustand'

/** Состояние рабочего места: сырой мастер-текст и будущие структуры (темы, узлы и т.д.). */
interface StreamWorkspaceState {
  masterRawText: string
  setMasterRawText: (value: string) => void
}

export const useStreamWorkspaceStore = create<StreamWorkspaceState>((set) => ({
  masterRawText: '',
  setMasterRawText: (value) => set({ masterRawText: value }),
}))
