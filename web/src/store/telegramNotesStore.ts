import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TelegramNoteFolder, TelegramNoteState, TelegramNotesSnapshot, TelegramRoutingRuleSet } from '../domain/telegramNotes'

const DEFAULT_PRESETS: TelegramRoutingRuleSet[] = [
  {
    id: 'balanced',
    name: 'Сбалансированный',
    priorityToState: { high: 'in_work', normal: 'inbox', low: 'inbox' },
    folderToState: { work: 'in_work', finance: 'in_work', media: 'archived' },
    defaultState: 'inbox',
  },
  {
    id: 'focus-work',
    name: 'Фокус на работе',
    priorityToState: { high: 'in_work', normal: 'in_work', low: 'inbox' },
    folderToState: { work: 'in_work', finance: 'in_work', media: 'archived', ideas: 'inbox', misc: 'inbox' },
    defaultState: 'inbox',
  },
]

interface TelegramNotesStoreState {
  snapshot: TelegramNotesSnapshot | null
  selectedIds: string[]
  routingPresets: TelegramRoutingRuleSet[]
  activePresetId: string
  setSnapshot: (snapshot: TelegramNotesSnapshot) => void
  setItemState: (id: string, state: TelegramNoteState) => void
  setItemFolder: (id: string, folder: TelegramNoteFolder) => void
  applyStateToSelected: (state: TelegramNoteState) => void
  applyFolderToSelected: (folder: TelegramNoteFolder) => void
  toggleSelected: (id: string) => void
  clearSelection: () => void
  selectAll: (ids: string[]) => void
  setActivePreset: (presetId: string) => void
  updateActivePreset: (patch: Partial<TelegramRoutingRuleSet>) => void
  applyAutoRouting: () => void
  clear: () => void
}

function getActivePreset(state: Pick<TelegramNotesStoreState, 'routingPresets' | 'activePresetId'>): TelegramRoutingRuleSet {
  return state.routingPresets.find((p) => p.id === state.activePresetId) ?? state.routingPresets[0] ?? DEFAULT_PRESETS[0]
}

export const useTelegramNotesStore = create<TelegramNotesStoreState>()(
  persist(
    (set) => ({
      snapshot: null,
      selectedIds: [],
      routingPresets: DEFAULT_PRESETS,
      activePresetId: DEFAULT_PRESETS[0].id,
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
      setActivePreset: (presetId) => set({ activePresetId: presetId }),
      updateActivePreset: (patch) =>
        set((store) => ({
          routingPresets: store.routingPresets.map((preset) =>
            preset.id === store.activePresetId
              ? {
                  ...preset,
                  ...patch,
                  priorityToState: { ...preset.priorityToState, ...(patch.priorityToState ?? {}) },
                  folderToState: { ...preset.folderToState, ...(patch.folderToState ?? {}) },
                }
              : preset,
          ),
        })),
      applyAutoRouting: () =>
        set((store) => {
          if (!store.snapshot) return store
          const preset = getActivePreset(store)
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => {
                const fromPriority = preset.priorityToState[item.priority]
                const fromFolder = preset.folderToState[item.folder]
                return { ...item, state: fromPriority ?? fromFolder ?? preset.defaultState }
              }),
            },
          }
        }),
      clear: () =>
        set({
          snapshot: null,
          selectedIds: [],
          routingPresets: DEFAULT_PRESETS,
          activePresetId: DEFAULT_PRESETS[0].id,
        }),
    }),
    {
      name: 'model-telegram-notes-v1',
      partialize: (state) => ({
        snapshot: state.snapshot,
        routingPresets: state.routingPresets,
        activePresetId: state.activePresetId,
      }),
    },
  ),
)
