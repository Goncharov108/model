import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pruneEmptyStructureNotes } from '../lib/structureNotes'

interface StructureNotesState {
  notesById: Record<string, string>
  /** Заметка владельца к структуре по id; пустая строка удаляет запись. */
  setNote: (structureId: string, text: string) => void
}

export const useStructureNotesStore = create<StructureNotesState>()(
  persist(
    (set) => ({
      notesById: {},
      setNote: (structureId, text) =>
        set((state) => {
          const merged = { ...state.notesById, [structureId]: text }
          return { notesById: pruneEmptyStructureNotes(merged) }
        }),
    }),
    {
      name: 'model-structure-notes-v1',
      partialize: (state) => ({ notesById: state.notesById }),
    },
  ),
)
