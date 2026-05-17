import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TelegramNoteFolder, TelegramNoteState, TelegramNotesSnapshot } from '../domain/telegramNotes'

interface TelegramNotesStoreState {
  snapshot: TelegramNotesSnapshot | null
  selectedIds: string[]
  setSnapshot: (snapshot: TelegramNotesSnapshot) => void
  setItemState: (id: string, state: TelegramNoteState) => void
  setItemFolder: (id: string, folder: TelegramNoteFolder) => void
  applyStateToSelected: (state: TelegramNoteState) => void
  applyFolderToSelected: (folder: TelegramNoteFolder) => void
  toggleSelected: (id: string) => void
  clearSelection: () => void
  selectAll: (ids: string[]) => void
  applyAutoRouting: () => void
  clear: () => void
}

export const useTelegramNotesStore = create<TelegramNotesStoreState>()(
  persist(
    (set) => ({
      snapshot: null,
      selectedIds: [],
      setSnapshot: (snapshot) => set({ snapshot, selectedIds: [] }),
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
      setItemFolder: (id, folder) =>
        set((store) => {
          if (!store.snapshot) return store
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => (item.id === id ? { ...item, folder } : item)),
            },
          }
        }),
      applyStateToSelected: (state) =>
        set((store) => {
          if (!store.snapshot || store.selectedIds.length === 0) return store
          const selected = new Set(store.selectedIds)
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => (selected.has(item.id) ? { ...item, state } : item)),
            },
          }
        }),
      applyFolderToSelected: (folder) =>
        set((store) => {
          if (!store.snapshot || store.selectedIds.length === 0) return store
          const selected = new Set(store.selectedIds)
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => (selected.has(item.id) ? { ...item, folder } : item)),
            },
          }
        }),
      toggleSelected: (id) =>
        set((store) => {
          const exists = store.selectedIds.includes(id)
          return { selectedIds: exists ? store.selectedIds.filter((x) => x !== id) : [...store.selectedIds, id] }
        }),
      clearSelection: () => set({ selectedIds: [] }),
      selectAll: (ids) => set({ selectedIds: [...new Set(ids)] }),
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
      clear: () => set({ snapshot: null, selectedIds: [] }),
    }),
    {
      name: 'model-telegram-notes-v1',
      partialize: (state) => ({ snapshot: state.snapshot }),
    },
  ),
)
