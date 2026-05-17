import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TelegramNoteState, TelegramNotesSnapshot } from '../domain/telegramNotes'

interface TelegramNotesStoreState {
  snapshot: TelegramNotesSnapshot | null
  setSnapshot: (snapshot: TelegramNotesSnapshot) => void
  setItemState: (id: string, state: TelegramNoteState) => void
  applyAutoRouting: () => void
  clear: () => void
}

export const useTelegramNotesStore = create<TelegramNotesStoreState>()(
  persist(
    (set) => ({
      snapshot: null,
      setSnapshot: (snapshot) => set({ snapshot }),
      setItemState: (id, state) =>
        set((store) => {
          if (!store.snapshot) return store
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => (item.id === id ? { ...item, state } : item)),
            },
          }
        }),
      applyAutoRouting: () =>
        set((store) => {
          if (!store.snapshot) return store
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => {
                if (item.priority === 'high') return { ...item, state: 'in_work' }
                if (item.folder === 'work' || item.folder === 'finance') return { ...item, state: 'in_work' }
                if (item.folder === 'media') return { ...item, state: 'archived' }
                return { ...item, state: 'inbox' }
              }),
            },
          }
        }),
      clear: () => set({ snapshot: null }),
    }),
    {
      name: 'model-telegram-notes-v1',
      partialize: (state) => ({ snapshot: state.snapshot }),
    },
  ),
)
